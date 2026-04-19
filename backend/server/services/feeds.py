import random
from datetime import datetime
from typing import Dict, List, Tuple

from sqlalchemy.orm import Session

from server.core.models import RepoSnapshot
from server.core.schemas import FeedActor, FeedItem, RepositoryModel
from server.services.github import GitHubService


def persist_repositories(db: Session, repos: List[RepositoryModel]) -> None:
    now = datetime.utcnow()
    for repo in repos:
        existing = (
            db.query(RepoSnapshot)
            .filter(RepoSnapshot.github_repo_id == repo.id)
            .one_or_none()
        )
        payload = repo.model_dump()
        if existing:
            existing.full_name = repo.full_name
            existing.name = repo.name
            existing.owner_login = repo.owner.login
            existing.description = repo.description
            existing.language = repo.language
            existing.stars = repo.stargazers_count
            existing.forks = repo.forks_count
            existing.watchers = repo.watchers_count
            existing.open_issues = repo.open_issues_count
            existing.homepage = repo.homepage
            existing.raw_payload = payload
            existing.last_seen_at = now
            existing.updated_at = now
        else:
            db.add(
                RepoSnapshot(
                    github_repo_id=repo.id,
                    full_name=repo.full_name,
                    name=repo.name,
                    owner_login=repo.owner.login,
                    description=repo.description,
                    language=repo.language,
                    stars=repo.stargazers_count,
                    forks=repo.forks_count,
                    watchers=repo.watchers_count,
                    open_issues=repo.open_issues_count,
                    homepage=repo.homepage,
                    raw_payload=payload,
                    last_seen_at=now,
                )
            )
    db.commit()


def dedupe_feed(items: List[FeedItem]) -> List[FeedItem]:
    seen = set()
    unique = []
    for item in items:
        if item.repo.id in seen:
            continue
        seen.add(item.repo.id)
        unique.append(item)
    return unique


def get_personalized_feed(service: GitHubService, username: str, limit: int = 30) -> List[FeedItem]:
    following = service.fetch_following(username, per_page=50)
    feed_items: List[FeedItem] = []

    for user in following[:20]:
        try:
            starred = service.fetch_starred(user["login"], per_page=5)
        except Exception:
            continue
        for repo in starred:
            feed_items.append(
                FeedItem(
                    type="starred",
                    repo=repo,
                    actor=FeedActor(
                        login=user["login"],
                        avatar_url=user["avatar_url"],
                        html_url=user["html_url"],
                    ),
                    timestamp=datetime.utcnow().isoformat(),
                    reason=f'{user["login"]} starred this',
                )
            )

    for user in following[:15]:
        try:
            repos = service.fetch_user_repos(user["login"], per_page=3, sort="created")
        except Exception:
            continue
        for repo in repos:
            if not repo.fork and repo.full_name.startswith(f'{user["login"]}/'):
                feed_items.append(
                    FeedItem(
                        type="created",
                        repo=repo,
                        actor=FeedActor(
                            login=user["login"],
                            avatar_url=user["avatar_url"],
                            html_url=user["html_url"],
                        ),
                        timestamp=repo.created_at,
                        reason=f'{user["login"]} created this',
                    )
                )

    feed_items.sort(key=lambda item: item.repo.stargazers_count, reverse=True)
    return dedupe_feed(feed_items)[:limit]


def get_trending_in_network(service: GitHubService, username: str, limit: int = 30) -> List[FeedItem]:
    following = service.fetch_following(username, per_page=50)
    repo_counts: Dict[int, Dict] = {}

    for user in following:
        try:
            starred = service.fetch_starred(user["login"], per_page=10)
        except Exception:
            continue
        for repo in starred:
            existing = repo_counts.get(repo.id)
            if existing:
                existing["count"] += 1
                existing["actors"].append(user)
            else:
                repo_counts[repo.id] = {"repo": repo, "count": 1, "actors": [user]}

    ranked_items = []
    for item in repo_counts.values():
        if item["count"] < 2:
            continue
        actor = item["actors"][0]
        ranked_items.append(
            (
                item["count"],
                FeedItem(
                    type="trending",
                    repo=item["repo"],
                    actor=FeedActor(
                        login=actor["login"],
                        avatar_url=actor["avatar_url"],
                        html_url=actor["html_url"],
                    ),
                    timestamp=datetime.utcnow().isoformat(),
                    reason=f'{item["count"]} people you follow starred this',
                ),
            )
        )
    ranked_items.sort(key=lambda item: item[0], reverse=True)
    return [item for _, item in ranked_items[:limit]]


def get_network_activity(service: GitHubService, username: str, limit: int = 30) -> List[FeedItem]:
    items: List[FeedItem] = []
    try:
        events = service.fetch_received_events(username, per_page=100)
    except Exception:
        return []

    for event in events:
        repo_meta = event.get("repo")
        actor = event.get("actor")
        if not repo_meta or not actor:
            continue
        if event.get("type") not in {"WatchEvent", "ForkEvent"}:
            continue
        try:
            repo = service.fetch_repo(repo_meta["name"])
        except Exception:
            continue
        items.append(
            FeedItem(
                type="starred" if event["type"] == "WatchEvent" else "forked",
                repo=repo,
                actor=FeedActor(
                    login=actor["login"],
                    avatar_url=actor["avatar_url"],
                    html_url=f'https://github.com/{actor["login"]}',
                ),
                timestamp=event.get("created_at", datetime.utcnow().isoformat()),
                reason=f'{actor["login"]} {"starred" if event["type"] == "WatchEvent" else "forked"} this',
            )
        )
    return dedupe_feed(items)[:limit]


def get_extended_network_feed(
    service: GitHubService,
    username: str,
    limit: int = 50,
    offset: int = 0,
) -> List[FeedItem]:
    following = service.fetch_following(username, per_page=30)
    second_degree = []

    for user in following[:10]:
        try:
            their_following = service.fetch_following(user["login"], per_page=15)
        except Exception:
            continue
        for followed_user in their_following:
            if followed_user["login"] == username:
                continue
            if any(existing["login"] == followed_user["login"] for existing in following):
                continue
            second_degree.append(
                {
                    **followed_user,
                    "connected_via": user["login"],
                }
            )

    unique_second_degree = []
    seen_users = set()
    for user in second_degree:
        if user["login"] in seen_users:
            continue
        seen_users.add(user["login"])
        unique_second_degree.append(user)

    feed_items: List[FeedItem] = []
    seen_repos = set()
    window = unique_second_degree[offset : offset + 15]

    for user in window:
        try:
            starred = service.fetch_starred(user["login"], per_page=5)
        except Exception:
            starred = []
        for repo in starred:
            if repo.id in seen_repos:
                continue
            seen_repos.add(repo.id)
            feed_items.append(
                FeedItem(
                    type="starred",
                    repo=repo,
                    actor=FeedActor(
                        login=user["login"],
                        avatar_url=user["avatar_url"],
                        html_url=user["html_url"],
                    ),
                    timestamp=datetime.utcnow().isoformat(),
                    reason=f'{user["login"]} starred this (via {user["connected_via"]})',
                    connectionDegree=2,
                )
            )

    for user in window[:10]:
        try:
            repos = service.fetch_user_repos(user["login"], per_page=3, sort="updated")
        except Exception:
            repos = []
        for repo in repos:
            if repo.id in seen_repos:
                continue
            if repo.stargazers_count <= 5:
                continue
            seen_repos.add(repo.id)
            feed_items.append(
                FeedItem(
                    type="created",
                    repo=repo,
                    actor=FeedActor(
                        login=user["login"],
                        avatar_url=user["avatar_url"],
                        html_url=user["html_url"],
                    ),
                    timestamp=repo.created_at,
                    reason=f'Created by {user["login"]} (via {user["connected_via"]})',
                    connectionDegree=2,
                )
            )

    random.shuffle(feed_items)
    feed_items.sort(key=lambda item: item.repo.stargazers_count, reverse=True)
    return feed_items[:limit]


def get_infinite_feed(
    service: GitHubService,
    username: str,
    page: int = 1,
    page_size: int = 20,
) -> Tuple[List[FeedItem], bool, int]:
    if page == 1:
        items = dedupe_feed(
            get_trending_in_network(service, username, 10)
            + get_personalized_feed(service, username, 15)
        )
        if not items:
            items = get_network_activity(service, username, limit=page_size)
        return items[:page_size], True, 2

    offset = (page - 2) * page_size
    items = get_extended_network_feed(service, username, page_size, offset=offset)
    return items, len(items) >= page_size, page + 1
