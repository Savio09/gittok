from typing import Any, Dict, Optional

from fastapi import APIRouter, Depends, Header, HTTPException, Query
from fastapi.responses import Response
from sqlalchemy.orm import Session

from server.core.config import settings
from server.core.database import get_db
from server.core.models import MessageRequest
from server.core.schemas import (
    ContributorListResponse,
    MessageRequestCreate,
    MessageRequestOut,
    MessageRequestResponse,
    PersonalizedFeedRequest,
    RepoBatchRequest,
    RepoListResponse,
    SlideshowBatchRequest,
    SlideshowBatchResponse,
    SpeechAudioRequest,
)
from server.services.feeds import get_infinite_feed, persist_repositories
from server.services.github import GitHubService
from server.services.speech import (
    SpeechServiceUnavailableError,
    SpeechSynthesisError,
    synthesize_speech,
)
from server.services.slides import build_slideshows


router = APIRouter()


def verify_proxy_secret(x_gittok_proxy_secret: str = Header(default="")) -> None:
    if settings.backend_proxy_secret and x_gittok_proxy_secret != settings.backend_proxy_secret:
        raise HTTPException(status_code=401, detail="Invalid proxy secret")


@router.get("/health")
def health() -> Dict[str, str]:
    return {"status": "ok"}


@router.get("/api/trending")
def trending(
    language: Optional[str] = Query(default=None),
    limit: int = Query(default=30, ge=1, le=100),
    db: Session = Depends(get_db),
) -> RepoListResponse:
    repos = GitHubService().fetch_trending_repos(language=language, limit=limit)
    persist_repositories(db, repos)
    return RepoListResponse(repos=repos)


@router.get("/api/search")
def search(
    q: str = Query(..., min_length=1, max_length=256),
    limit: int = Query(default=30, ge=1, le=100),
    db: Session = Depends(get_db),
) -> RepoListResponse:
    repos = GitHubService().search_repos(query=q, limit=limit)
    persist_repositories(db, repos)
    return RepoListResponse(repos=repos)


@router.get("/api/following")
def following(user: str = Query(..., min_length=1), db: Session = Depends(get_db)) -> RepoListResponse:
    repos = GitHubService().fetch_user_following_forked_repos(user)
    persist_repositories(db, repos)
    return RepoListResponse(repos=repos)


@router.post("/api/repos/batch")
def repos_batch(
    payload: RepoBatchRequest,
    db: Session = Depends(get_db),
) -> RepoListResponse:
    if not payload.repos or len(payload.repos) > 25:
        raise HTTPException(status_code=400, detail="repos must contain between 1 and 25 items")
    repos = GitHubService().fetch_repos_batch(payload.repos)
    persist_repositories(db, repos)
    return RepoListResponse(repos=repos)


@router.post("/api/feed/personalized")
def personalized_feed(
    payload: PersonalizedFeedRequest,
    db: Session = Depends(get_db),
    _: None = Depends(verify_proxy_secret),
) -> Dict[str, Any]:
    service = GitHubService(token=payload.github_token)
    items, has_more, next_page = get_infinite_feed(
        service,
        payload.github_username,
        page=payload.page,
        page_size=payload.page_size,
    )
    persist_repositories(db, [item.repo for item in items])
    return {
        "items": [item.model_dump(by_alias=True) for item in items],
        "source": "personalized",
        "username": payload.github_username,
        "pagination": {
            "page": payload.page,
            "pageSize": payload.page_size,
            "hasMore": has_more,
            "nextPage": next_page,
        },
    }


@router.post("/api/slideshows/batch")
def slideshows_batch(
    payload: SlideshowBatchRequest,
    db: Session = Depends(get_db),
) -> SlideshowBatchResponse:
    persist_repositories(db, payload.repos)
    return SlideshowBatchResponse(slideshows=build_slideshows(payload.repos))


@router.post("/api/audio/speech")
def audio_speech(
    payload: SpeechAudioRequest,
    _: None = Depends(verify_proxy_secret),
) -> Response:
    try:
        audio_bytes, media_type = synthesize_speech(payload.text, payload.voice)
    except SpeechServiceUnavailableError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except SpeechSynthesisError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    return Response(
        content=audio_bytes,
        media_type=media_type,
        headers={"Cache-Control": "public, max-age=31536000, immutable"},
    )


@router.get("/api/repos/{owner}/{repo}/contributors")
def contributors(owner: str, repo: str, limit: int = Query(default=20, ge=1, le=100)) -> ContributorListResponse:
    service = GitHubService()
    return ContributorListResponse(contributors=service.fetch_contributors(f"{owner}/{repo}", limit=limit))


@router.post("/api/messages/requests")
def create_message_request(payload: MessageRequestCreate, db: Session = Depends(get_db)) -> MessageRequestResponse:
    record = MessageRequest(
        repo_full_name=payload.repo_full_name,
        contributor_github_login=payload.contributor_github_login,
        requester_github_login=payload.requester_github_login,
        requester_name=payload.requester_name,
        requester_email=payload.requester_email,
        interest=payload.interest,
        background=payload.background,
        message=payload.message,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return MessageRequestResponse(
        request=MessageRequestOut(
            id=record.id,
            repoFullName=record.repo_full_name,
            contributorGithubLogin=record.contributor_github_login,
            requesterGithubLogin=record.requester_github_login,
            requesterName=record.requester_name,
            requesterEmail=record.requester_email,
            interest=record.interest,
            background=record.background,
            message=record.message,
            status=record.status,
            createdAt=record.created_at.isoformat(),
        )
    )
