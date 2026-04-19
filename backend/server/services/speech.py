import hashlib
import json
from pathlib import Path
from typing import Optional, Tuple

import httpx

from server.core.config import settings


CONTENT_TYPES = {
    "aac": "audio/aac",
    "flac": "audio/flac",
    "mp3": "audio/mpeg",
    "opus": "audio/ogg",
    "wav": "audio/wav",
}

CACHE_DIR = Path(__file__).resolve().parents[2] / "cache" / "tts"


class SpeechServiceUnavailableError(RuntimeError):
    pass


class SpeechSynthesisError(RuntimeError):
    pass


def synthesize_speech(
    text: str, voice: Optional[str] = None
) -> Tuple[bytes, str]:
    """Synthesize speech. `voice` is the explicit voice ID (set per-repo by the frontend)."""
    normalized_text = text.strip()
    if not normalized_text:
        raise SpeechSynthesisError("Text-to-speech input cannot be empty")

    provider = _resolve_provider()
    cache_metadata = _cache_metadata(provider=provider, text=normalized_text, voice=voice)
    cache_path = _get_cache_path(cache_metadata)

    if cache_path.exists():
        return cache_path.read_bytes(), _content_type_for(cache_metadata["response_format"])

    if provider == "elevenlabs":
        audio_bytes, content_type = _synthesize_with_elevenlabs(normalized_text, voice)
    elif provider == "cloudflare":
        audio_bytes, content_type = _synthesize_with_cloudflare(normalized_text, voice)
    elif provider == "openai":
        audio_bytes, content_type = _synthesize_with_openai(normalized_text, voice)
    else:
        raise SpeechServiceUnavailableError(f"Unsupported text-to-speech provider: {provider}")

    cache_path.parent.mkdir(parents=True, exist_ok=True)
    cache_path.write_bytes(audio_bytes)
    return audio_bytes, content_type


def _resolve_provider() -> str:
    configured_provider = settings.tts_provider.strip().lower()
    if configured_provider in {"elevenlabs", "cloudflare", "openai"}:
        return configured_provider

    # Auto-resolve: prefer ElevenLabs > OpenAI > Cloudflare
    if settings.elevenlabs_api_key:
        return "elevenlabs"

    if settings.openai_api_key:
        return "openai"

    if settings.cloudflare_api_token and settings.cloudflare_account_id:
        return "cloudflare"

    raise SpeechServiceUnavailableError(
        "Text-to-speech is not configured. Set ElevenLabs, OpenAI, or Cloudflare credentials."
    )


def _synthesize_with_elevenlabs(text: str, voice: Optional[str]) -> Tuple[bytes, str]:
    if not settings.elevenlabs_api_key:
        raise SpeechServiceUnavailableError("ElevenLabs text-to-speech is not configured")

    voice_id = (voice or settings.elevenlabs_voice_id).strip()
    model_id = settings.elevenlabs_model_id.strip()
    endpoint = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"

    payload = {
        "text": text,
        "model_id": model_id,
        "voice_settings": {
            "stability": 0.5,
            "similarity_boost": 0.75,
            "style": 0.3,
            "use_speaker_boost": True,
        },
    }

    try:
        with httpx.Client(timeout=90.0) as client:
            response = client.post(
                endpoint,
                headers={
                    "xi-api-key": settings.elevenlabs_api_key,
                    "Content-Type": "application/json",
                    "Accept": "audio/mpeg",
                },
                json=payload,
            )
        response.raise_for_status()
    except httpx.HTTPStatusError as exc:
        detail = _extract_error_message(exc.response, "ElevenLabs")
        raise SpeechSynthesisError(detail) from exc
    except httpx.HTTPError as exc:
        raise SpeechSynthesisError("Failed to reach ElevenLabs text-to-speech") from exc

    return response.content, "audio/mpeg"


def _synthesize_with_openai(text: str, voice: Optional[str]) -> Tuple[bytes, str]:
    if not settings.openai_api_key:
        raise SpeechServiceUnavailableError("OpenAI text-to-speech is not configured")

    selected_voice = (voice or settings.openai_tts_voice).strip()
    response_format = settings.openai_tts_format.strip().lower() or "mp3"
    payload = {
        "model": settings.openai_tts_model,
        "voice": selected_voice,
        "input": text,
        "response_format": response_format,
    }

    try:
        with httpx.Client(timeout=90.0) as client:
            response = client.post(
                "https://api.openai.com/v1/audio/speech",
                headers={
                    "Authorization": f"Bearer {settings.openai_api_key}",
                    "Content-Type": "application/json",
                },
                json=payload,
            )
        response.raise_for_status()
    except httpx.HTTPStatusError as exc:
        detail = _extract_error_message(exc.response, "OpenAI")
        raise SpeechSynthesisError(detail) from exc
    except httpx.HTTPError as exc:
        raise SpeechSynthesisError("Failed to reach OpenAI text-to-speech") from exc

    return response.content, _content_type_for(response_format)


def _synthesize_with_cloudflare(text: str, voice: Optional[str]) -> Tuple[bytes, str]:
    if not settings.cloudflare_api_token or not settings.cloudflare_account_id:
        raise SpeechServiceUnavailableError("Cloudflare Workers AI text-to-speech is not configured")

    selected_speaker = (voice or settings.cloudflare_tts_speaker).strip()
    encoding = settings.cloudflare_tts_encoding.strip().lower() or "mp3"
    payload = {
        "text": text,
        "speaker": selected_speaker,
        "encoding": encoding,
        "container": settings.cloudflare_tts_container.strip().lower() or "none",
    }

    endpoint = (
        "https://api.cloudflare.com/client/v4/accounts/"
        f"{settings.cloudflare_account_id}/ai/run/{settings.cloudflare_tts_model}"
    )

    try:
        with httpx.Client(timeout=90.0) as client:
            response = client.post(
                endpoint,
                headers={
                    "Authorization": f"Bearer {settings.cloudflare_api_token}",
                    "Content-Type": "application/json",
                },
                json=payload,
            )
        response.raise_for_status()
    except httpx.HTTPStatusError as exc:
        detail = _extract_error_message(exc.response, "Cloudflare Workers AI")
        raise SpeechSynthesisError(detail) from exc
    except httpx.HTTPError as exc:
        raise SpeechSynthesisError("Failed to reach Cloudflare Workers AI text-to-speech") from exc

    content_type = response.headers.get("Content-Type") or _content_type_for(encoding)
    return response.content, content_type


def _cache_metadata(provider: str, text: str, voice: Optional[str]) -> dict[str, str]:
    if provider == "elevenlabs":
        return {
            "provider": provider,
            "model": settings.elevenlabs_model_id,
            "voice": (voice or settings.elevenlabs_voice_id).strip(),
            "response_format": "mp3",
            "text": text,
        }

    if provider == "cloudflare":
        return {
            "provider": provider,
            "model": settings.cloudflare_tts_model,
            "voice": (voice or settings.cloudflare_tts_speaker).strip(),
            "response_format": settings.cloudflare_tts_encoding.strip().lower() or "mp3",
            "text": text,
        }

    if provider == "openai":
        return {
            "provider": provider,
            "model": settings.openai_tts_model,
            "voice": (voice or settings.openai_tts_voice).strip(),
            "response_format": settings.openai_tts_format.strip().lower() or "mp3",
            "text": text,
        }

    return {
        "provider": provider,
        "model": "unknown",
        "voice": (voice or "").strip(),
        "response_format": "mp3",
        "text": text,
    }


def _get_cache_path(metadata: dict[str, str]) -> Path:
    payload = json.dumps(metadata, sort_keys=True, separators=(",", ":"))
    digest = hashlib.sha256(payload.encode("utf-8")).hexdigest()
    extension = metadata["response_format"] or "mp3"
    return CACHE_DIR / f"{digest}.{extension}"


def _content_type_for(response_format: str) -> str:
    return CONTENT_TYPES.get(response_format, "audio/mpeg")


def _extract_error_message(response: httpx.Response, provider_name: str) -> str:
    try:
        payload = response.json()
    except ValueError:
        return f"{provider_name} text-to-speech failed with status {response.status_code}"

    if isinstance(payload, dict):
        error = payload.get("error")
        if isinstance(error, dict):
            message = error.get("message")
            if isinstance(message, str) and message.strip():
                return message

        errors = payload.get("errors")
        if isinstance(errors, list) and errors:
            first = errors[0]
            if isinstance(first, dict):
                message = first.get("message")
                if isinstance(message, str) and message.strip():
                    return message

        message = payload.get("message")
        if isinstance(message, str) and message.strip():
            return message

    return f"{provider_name} text-to-speech failed with status {response.status_code}"
