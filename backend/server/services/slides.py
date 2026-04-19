import hashlib
import json
import logging
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Optional

import httpx

from server.core.config import settings
from server.core.schemas import IssueModel, RepositoryModel, Slide, Slideshow
from server.services.github import GitHubService

logger = logging.getLogger(__name__)

TRANSCRIPT_CACHE_DIR = Path(__file__).resolve().parents[2] / "cache" / "transcripts"

# ── Speaking rate constants for duration calculation ──
# ElevenLabs / OpenAI TTS speak at roughly 150-170 WPM.
# We target 160 WPM and add padding for pauses and transitions.
_WORDS_PER_MINUTE = 160
_MIN_SLIDE_DURATION = 3.0
_MAX_SLIDE_DURATION = 12.0


def _estimate_duration(transcript: str) -> float:
    """Estimate slide duration in seconds based on transcript word count."""
    words = len(transcript.split())
    seconds = (words / _WORDS_PER_MINUTE) * 60
    # Add small padding for pauses between slides
    return round(min(max(seconds + 0.8, _MIN_SLIDE_DURATION), _MAX_SLIDE_DURATION), 1)


def _pick_voice_for_repo(repo_id: int) -> Optional[str]:
    """Deterministically pick one voice from the pool for this repo."""
    raw = settings.elevenlabs_voice_pool.strip()
    voices = [v.strip() for v in raw.split(",") if v.strip()]
    if not voices:
        return None
    return voices[repo_id % len(voices)]


TOPIC_HOOKS: Dict[str, str] = {
    "machine-learning": "Ever wondered how machines learn to think?",
    "deep-learning": "What if your code could learn on its own?",
    "ai": "Ready to see AI in action?",
    "web": "Building for the web just got easier.",
    "api": "What if integrating APIs was effortless?",
    "cli": "Love the terminal? You'll love this.",
    "framework": "Looking for a framework that just works?",
    "database": "Need a smarter way to handle data?",
    "devops": "Tired of manual deployments?",
    "security": "How secure is your code, really?",
    "testing": "What if testing was actually enjoyable?",
    "react": "React developers, this one's for you.",
    "nextjs": "Taking Next.js to the next level.",
    "typescript": "Type-safe and loving it.",
    "python": "Pythonistas, pay attention.",
    "rust": "Blazing fast and memory safe.",
    "go": "Concurrency done right.",
    "docker": "Containerize everything.",
    "kubernetes": "Orchestration at scale.",
}


TOPIC_DESCRIPTIONS: Dict[str, str] = {
    "machine-learning": "Machine learning capabilities",
    "deep-learning": "Deep learning framework",
    "ai": "AI-powered functionality",
    "web": "Web-first architecture",
    "api": "API-first design",
    "cli": "Command-line interface",
    "framework": "Full framework solution",
    "database": "Data persistence layer",
    "devops": "DevOps automation tooling",
    "security": "Security-focused tooling",
    "testing": "Testing and QA utilities",
    "react": "React ecosystem integration",
    "nextjs": "Built on Next.js",
    "typescript": "Full TypeScript support",
    "python": "Python ecosystem",
    "rust": "High-performance Rust core",
    "go": "Built for concurrency with Go",
    "docker": "Containerized deployment",
    "kubernetes": "Kubernetes-native design",
    "graphql": "GraphQL API layer",
    "serverless": "Serverless architecture",
    "mobile": "Mobile-ready",
    "cross-platform": "Cross-platform support",
}


def _use_llm_transcripts() -> bool:
    provider = settings.transcript_provider.strip().lower()
    if provider == "llm":
        return bool(settings.openai_api_key)
    if provider == "template":
        return False
    # auto: use LLM if OpenAI key is available
    return bool(settings.openai_api_key)


def _transcript_cache_key(repo: RepositoryModel) -> str:
    payload = json.dumps(
        {"id": repo.id, "full_name": repo.full_name, "updated_at": repo.updated_at},
        sort_keys=True,
    )
    return hashlib.sha256(payload.encode()).hexdigest()


def _load_cached_transcripts(cache_key: str) -> Optional[Dict[str, str]]:
    path = TRANSCRIPT_CACHE_DIR / f"{cache_key}.json"
    if path.exists():
        try:
            return json.loads(path.read_text("utf-8"))
        except (json.JSONDecodeError, OSError):
            return None
    return None


def _save_cached_transcripts(cache_key: str, transcripts: Dict[str, str]) -> None:
    TRANSCRIPT_CACHE_DIR.mkdir(parents=True, exist_ok=True)
    path = TRANSCRIPT_CACHE_DIR / f"{cache_key}.json"
    path.write_text(json.dumps(transcripts, ensure_ascii=False), "utf-8")


def _generate_llm_transcripts(
    repo: RepositoryModel,
    readme_excerpt: str,
    features: List[str],
    description: str,
    issues: Optional[List[IssueModel]] = None,
) -> Optional[Dict[str, str]]:
    """Call GPT-4o-mini to generate unique transcripts for each slide type."""
    if not settings.openai_api_key:
        return None

    stars = fmt(repo.stargazers_count)
    forks = fmt(repo.forks_count)
    language = repo.language or "software"
    topics_str = ", ".join(repo.topics[:6]) if repo.topics else "none"
    features_str = "; ".join(features[:5]) if features else "none listed"
    readme_short = readme_excerpt[:800] if readme_excerpt else "No README available."

    issues_str = "No open issues fetched."
    if issues:
        issue_lines = []
        for iss in issues[:5]:
            labels_part = f" [{', '.join(iss.labels)}]" if iss.labels else ""
            issue_lines.append(f"  #{iss.number}: {iss.title}{labels_part}")
        issues_str = "\n".join(issue_lines)

    prompt = f"""You are writing voiceover scripts for a TikTok-style slideshow about a GitHub repository. Each slide is narrated by a different voice, so write each as if a different person is speaking. Be conversational, specific, and engaging — avoid generic filler.

Repository: {repo.full_name}
Language: {language}
Stars: {stars} | Forks: {forks}
Open issues count: {repo.open_issues_count}
Description: {description}
Topics: {topics_str}
Key features: {features_str}
Recent open issues:
{issues_str}
README excerpt: {readme_short}

Write exactly 7 transcript lines, one per slide type. Each should be 1-2 sentences, spoken naturally in under 8 seconds. Return ONLY valid JSON — no markdown, no code fences.

{{"intro": "An engaging hook that introduces the project — mention the name and why someone should care",
"overview": "What the project actually does, in plain language — be specific, not generic",
"features": "Highlight 2-3 standout features with enthusiasm",
"stats": "Put the star/fork numbers in context — compare, calculate growth, or express significance",
"issues": "Mention 1-2 notable open issues or areas where contributors are needed — frame it as an opportunity, not a flaw. If there are good-first-issue labels, highlight those as entry points for newcomers",
"topics": "Connect the tags/topics to real-world use cases or developer workflows",
"cta": "A casual, friendly call-to-action encouraging the viewer to check it out"}}"""

    try:
        with httpx.Client(timeout=15.0) as client:
            resp = client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {settings.openai_api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": settings.transcript_llm_model,
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.8,
                    "max_tokens": 600,
                },
            )
        resp.raise_for_status()
        content = resp.json()["choices"][0]["message"]["content"].strip()
        # Strip markdown code fences if the model wraps its output
        if content.startswith("```"):
            content = re.sub(r"^```\w*\n?", "", content)
            content = re.sub(r"\n?```$", "", content)
        transcripts = json.loads(content)
        # Validate all 7 keys are present and non-empty
        required = {"intro", "overview", "features", "stats", "issues", "topics", "cta"}
        if required.issubset(transcripts.keys()) and all(
            isinstance(v, str) and len(v.strip()) > 5 for v in transcripts.values()
        ):
            return {k: v.strip() for k, v in transcripts.items()}
        logger.warning("LLM transcripts missing required keys: %s", transcripts.keys())
        return None
    except Exception as exc:
        logger.warning("LLM transcript generation failed: %s", exc)
        return None


def build_slideshows(repos: List[RepositoryModel]) -> List[Slideshow]:
    service = GitHubService()
    use_llm = _use_llm_transcripts()
    slideshows = []
    for repo in repos:
        readme = service.fetch_readme_text(repo.full_name)
        features = extract_features(readme) or infer_features(repo)
        description = get_description(repo, readme)

        # Fetch open issues (best-effort — don't block on failure)
        issues: List[IssueModel] = []
        try:
            issues = service.fetch_issues(repo.full_name, limit=5)
        except Exception as exc:
            logger.warning("Failed to fetch issues for %s: %s", repo.full_name, exc)

        llm_transcripts: Optional[Dict[str, str]] = None
        if use_llm:
            cache_key = _transcript_cache_key(repo)
            llm_transcripts = _load_cached_transcripts(cache_key)
            if llm_transcripts is None:
                llm_transcripts = _generate_llm_transcripts(
                    repo, readme, features, description, issues
                )
                if llm_transcripts:
                    _save_cached_transcripts(cache_key, llm_transcripts)

        slideshows.append(
            Slideshow(
                repoId=repo.id,
                slides=build_slides(repo, features, description, llm_transcripts, issues),
                voice=_pick_voice_for_repo(repo.id),
            )
        )
    return slideshows


def extract_features(readme: str) -> List[str]:
    if not readme:
        return []
    section_match = re.search(
        r"(?:^|\n)##?\s*(?:Features|What|Why|Benefits|Highlights|Key Features)[^\n]*\n((?:[^\n]*\n){1,15})",
        readme,
        re.IGNORECASE,
    )
    if not section_match:
        return []
    bullets = re.findall(r"^\s*[-*•]\s+(.+)", section_match.group(1), re.MULTILINE)
    cleaned = []
    for bullet in bullets[:5]:
        value = bullet.replace("**", "").replace("`", "").strip()
        if 5 < len(value) < 120:
            cleaned.append(value)
    return cleaned


def infer_features(repo: RepositoryModel) -> List[str]:
    features: List[str] = []
    if repo.stargazers_count > 50000:
        features.append("One of GitHub's most starred projects")
    elif repo.stargazers_count > 10000:
        features.append("Trusted by tens of thousands of developers")
    elif repo.stargazers_count > 1000:
        features.append("Growing community of contributors")

    if repo.forks_count > 5000:
        features.append("Highly active contributor ecosystem")

    for topic in repo.topics[:6]:
        description = TOPIC_DESCRIPTIONS.get(topic.lower())
        if description and description not in features and len(features) < 5:
            features.append(description)

    if repo.language and len(features) < 3:
        features.append(f"Written in {repo.language}")

    if repo.open_issues_count > 50 and len(features) < 5:
        features.append("Active issue tracker; contributions welcome")

    return features[:5]


def get_description(repo: RepositoryModel, readme: str) -> str:
    if repo.description and len(repo.description) > 30:
        return repo.description

    if readme:
        match = re.search(r"^(?!#|!\[|<|```|\s*[-*])[A-Za-z].{30,}", readme, re.MULTILINE)
        if match:
            return match.group(0)[:200].strip()

    parts = [f'A {repo.language or "software"} project']
    if repo.topics:
        parts.append(f'for {", ".join(repo.topics[:3])}')
    parts.append(f"with {fmt(repo.stargazers_count)} stars on GitHub")
    return " ".join(parts) + "."


def _pick_hook(repo: RepositoryModel) -> Optional[str]:
    for topic in repo.topics:
        hook = TOPIC_HOOKS.get(topic.lower())
        if hook:
            return hook
    return None


def _repo_age_months(repo: RepositoryModel) -> int:
    try:
        created = datetime.fromisoformat(repo.created_at.replace("Z", "+00:00"))
        delta = datetime.now(timezone.utc) - created
        return max(1, int(delta.days / 30))
    except (ValueError, AttributeError):
        return 0


def _pick_intro(repo: RepositoryModel) -> str:
    language = repo.language or "software"
    stars = fmt(repo.stargazers_count)
    name = repo.name
    owner = repo.owner.login
    hook = _pick_hook(repo)
    age = _repo_age_months(repo)

    # Use a deterministic selector based on repo id so the same repo always
    # gets the same template — but different repos get variety.
    seed = int(hashlib.md5(str(repo.id).encode()).hexdigest(), 16)

    if repo.stargazers_count >= 50000:
        templates = [
            f"{hook + ' ' if hook else ''}This is {name} — one of the most starred projects on all of GitHub, with {stars} stars.",
            f"You have probably used {name} without even knowing it. {stars} stars and counting.",
            f"With {stars} stars, {name} needs no introduction. Let's see why developers love it.",
        ]
    elif repo.stargazers_count >= 10000:
        templates = [
            f"{hook + ' ' if hook else ''}Meet {name}, a {language} project trusted by tens of thousands of developers.",
            f"{name} has {stars} stars for a reason. Let's find out what makes this {language} project special.",
            f"@{owner} built something remarkable. {name} now has {stars} stars on GitHub.",
        ]
    elif repo.stargazers_count >= 1000:
        templates = [
            f"{hook + ' ' if hook else ''}Here's {name} — a rising {language} project by @{owner} with {stars} stars.",
            f"At {stars} stars, {name} is making waves in the {language} community.",
            f"@{owner}'s {name} just crossed {stars} stars. Here's the story.",
        ]
    elif age <= 6:
        templates = [
            f"Fresh on the scene: {name}, a {language} project already turning heads.",
            f"{hook + ' ' if hook else ''}{name} is brand new, and it's already got {stars} stars.",
            f"Just launched by @{owner}, {name} is a {language} project worth watching.",
        ]
    else:
        templates = [
            f"Meet {name} — a {language} project by @{owner} with {stars} stars on GitHub.",
            f"{hook + ' ' if hook else ''}Let's check out {name}, a {language} project by @{owner}.",
            f"@{owner} presents {name} — {stars} stars and built with {language}.",
        ]

    return templates[seed % len(templates)]


def _stats_commentary(repo: RepositoryModel) -> str:
    stars = fmt(repo.stargazers_count)
    forks = fmt(repo.forks_count)
    age = _repo_age_months(repo)

    if repo.stargazers_count >= 50000:
        commentary = f"With {stars} stars and {forks} forks, this is in the top tier of all open-source projects."
    elif repo.stargazers_count >= 10000:
        commentary = f"{stars} stars and {forks} forks — solidly in the top one percent of GitHub projects."
    elif repo.stargazers_count >= 1000:
        commentary = f"{stars} stars and {forks} forks. The community is paying attention."
    elif age and age <= 6 and repo.stargazers_count >= 100:
        stars_per_month = repo.stargazers_count / age
        commentary = f"Already at {stars} stars in just {age} months — that's about {int(stars_per_month)} stars per month."
    else:
        commentary = f"{stars} stars and {forks} forks so far. A solid foundation to build on."

    return commentary


def _issues_transcript(issues: List[IssueModel]) -> str:
    if not issues:
        return "No open issues right now — a clean slate for contributors."
    priority_labels = {"good first issue", "help wanted", "beginner", "easy"}
    beginner = [i for i in issues if priority_labels.intersection(set(l.lower() for l in i.labels))]
    if beginner:
        titles = ". ".join(i.title for i in beginner[:2])
        return f"Looking to contribute? There are beginner-friendly issues open: {titles}."
    titles = ". ".join(i.title for i in issues[:2])
    return f"Some open issues to know about: {titles}."


def build_slides(
    repo: RepositoryModel,
    features: List[str],
    description: str,
    llm_transcripts: Optional[Dict[str, str]] = None,
    issues: Optional[List[IssueModel]] = None,
) -> List[Slide]:
    language = repo.language or "software"
    t = llm_transcripts or {}
    issue_list = issues or []

    def _slide(slide_type: str, transcript: str, **kwargs) -> Slide:
        return Slide(
            type=slide_type,
            duration=_estimate_duration(transcript),
            transcript=transcript,
            **kwargs,
        )

    intro_text = t.get("intro") or _pick_intro(repo)
    slides = [_slide("intro", intro_text)]

    overview_text = t.get("overview") or description
    if len(overview_text) > 15:
        slides.append(_slide("overview", overview_text))

    if features:
        features_text = t.get("features") or f'Here is what makes it stand out: {". ".join(features[:3])}.'
        slides.append(_slide("features", features_text, features=features))

    stats_text = t.get("stats") or _stats_commentary(repo)
    slides.append(_slide("stats", stats_text))

    # Issues slide — only if there are open issues or LLM generated a transcript
    issues_text = t.get("issues") or (_issues_transcript(issue_list) if issue_list else "")
    if issues_text:
        slides.append(_slide("issues", issues_text, issues=issue_list[:3] if issue_list else None))

    topics_text = t.get("topics") or (
        f'Tagged under: {", ".join(repo.topics[:5])}.'
        if repo.topics
        else f"Built with {language}."
    )
    slides.append(_slide("topics", topics_text))

    cta_text = t.get("cta") or f"Find it on GitHub at {repo.full_name}. Tap below to explore."
    slides.append(_slide("cta", cta_text))

    return slides


def fmt(value: int) -> str:
    if value >= 1000000:
        return f"{value / 1000000:.1f}M"
    if value >= 1000:
        return f"{value / 1000:.1f}k"
    return str(value)
