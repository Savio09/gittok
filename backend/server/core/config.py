from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(".env", ".env.local", "../.env", "../.env.local"),
        extra="ignore",
    )

    frontend_origin: str = "http://localhost:3000"
    github_token: str = ""
    database_url: str = ""
    backend_proxy_secret: str = "dev-proxy-secret"
    tts_provider: str = "auto"
    elevenlabs_api_key: str = ""
    elevenlabs_voice_id: str = "JBFqnCBsd6RMkjVDRZzb"  # "George" — warm, natural male
    elevenlabs_model_id: str = "eleven_multilingual_v2"
    elevenlabs_voice_pool: str = (
        "onwK4e9ZLuTAKqWW03F9,"   # Daniel — authoritative British male
        "EXAVITQu4vr4xnSDxMaL,"   # Sarah — soft female
        "cgSgspJ2msm6clMCkdW9,"   # Jessica — energetic female
        "JBFqnCBsd6RMkjVDRZzb,"   # George — warm male
        "pFZP5JQG7iQjIQuC4Bku,"   # Lily — warm British female
        "iP95p4xoKVk53GoZ742B"    # Chris — casual male
    )
    openai_api_key: str = ""
    transcript_provider: str = "auto"  # "template", "llm", or "auto" (llm if openai key present)
    transcript_llm_model: str = "gpt-4o-mini"
    openai_tts_model: str = "gpt-4o-mini-tts"
    openai_tts_voice: str = "alloy"
    openai_tts_format: str = "mp3"
    cloudflare_api_token: str = ""
    cloudflare_account_id: str = ""
    cloudflare_tts_model: str = "@cf/deepgram/aura-2-en"
    cloudflare_tts_speaker: str = "luna"
    cloudflare_tts_encoding: str = "mp3"
    cloudflare_tts_container: str = "none"

    @property
    def resolved_database_url(self) -> str:
        if not self.database_url:
            raise RuntimeError(
                "DATABASE_URL is not set. Point it at your Neon PostgreSQL instance."
            )
        url = self.database_url
        if url.startswith("postgresql://"):
            return url.replace("postgresql://", "postgresql+psycopg://", 1)
        return url


settings = Settings()
