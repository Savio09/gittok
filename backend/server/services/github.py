import re
from typing import Dict, List, Optional

import httpx

from server.core.config import settings
from server.core.schemas import ContributorModel, IssueModel, RepositoryModel


class GitHubService:
    def __init__(self, token: Optional[str] = None) -> None:
        self.token = token or settings.github_token or None

    @property
    def headers(self) -> Dict[str, str]:
        headers = {
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
        }
        if self.token:
            headers["Authorization"] = f"Bearer {self.token}"
        return headers

    def _request_json(self, url: str, params: Optional[Dict[str, str]] = None) -> Dict:
        with httpx.Client(timeout=20.0, headers=self.headers) as client:
            response = client.get(url, params=params)
            response.raise_for_status()
            return response.json()

    def _request_list(self, url: str, params: Optional[Dict[str, str]] = None) -> List[Dict]:
        with httpx.Client(timeout=20.0, headers=self.headers) as client:
            response = client.get(url, params=params)
            response.raise_for_status()
            return response.json()

    def fetch_trending_repos(self, language: Optional[str] = None, limit: int = 30) -> List[RepositoryModel]:
        from datetime import datetime, timedelta

        last_week = (datetime.utcnow() - timedelta(days=7)).strftime("%Y-%m-%d")
        query = f"created:>{last_week} stars:>50"
        if language:
            query += f" language:{language}"

        payload = self._request_json(
            "https://api.github.com/search/repositories",
            params={"q": query, "sort": "stars", "order": "desc", "per_page": str(limit)},
        )
        return [normalize_repo(item) for item in payload.get("items", [])]

    def search_repos(self, query: str, limit: int = 30) -> List[RepositoryModel]:
        payload = self._request_json(
            "https://api.github.com/search/repositories",
            params={"q": query, "sort": "stars", "order": "desc", "per_page": str(limit)},
        )
        return [normalize_repo(item) for item in payload.get("items", [])]

    def fetch_following(self, username: str, per_page: int = 50) -> List[Dict]:
        return self._request_list(
            f"https://api.github.com/users/{username}/following",
            params={"per_page": str(per_page)},
        )

    def fetch_starred(self, username: str, per_page: int = 10) -> List[RepositoryModel]:
        payload = self._request_list(
            f"https://api.github.com/users/{username}/starred",
            params={"per_page": str(per_page), "sort": "created", "direction": "desc"},
        )
        return [normalize_repo(item) for item in payload]

    def fetch_user_repos(
        self,
        username: str,
        per_page: int = 10,
        sort: str = "created",
        direction: str = "desc",
    ) -> List[RepositoryModel]:
        payload = self._request_list(
            f"https://api.github.com/users/{username}/repos",
            params={
                "per_page": str(per_page),
                "sort": sort,
                "direction": direction,
                "type": "all",
            },
        )
        return [normalize_repo(item) for item in payload]

    def fetch_user_following_forked_repos(self, username: str) -> List[RepositoryModel]:
        following = self.fetch_following(username, per_page=20)
        repos: List[RepositoryModel] = []
        seen = set()
        for user in following:
            for repo in self.fetch_user_repos(user["login"], per_page=10):
                if not repo.fork or repo.id in seen:
                    continue
                seen.add(repo.id)
                repos.append(repo)
        repos.sort(key=lambda repo: repo.stargazers_count, reverse=True)
        return repos[:30]

    def fetch_repo(self, full_name: str) -> RepositoryModel:
        payload = self._request_json(f"https://api.github.com/repos/{full_name}")
        return normalize_repo(payload)

    def fetch_repos_batch(self, full_names: List[str]) -> List[RepositoryModel]:
        repos = []
        for full_name in full_names:
            try:
                repos.append(self.fetch_repo(full_name))
            except httpx.HTTPError:
                continue
        return repos

    def fetch_received_events(self, username: str, per_page: int = 100) -> List[Dict]:
        return self._request_list(
            f"https://api.github.com/users/{username}/received_events",
            params={"per_page": str(per_page)},
        )

    def fetch_contributors(self, full_name: str, limit: int = 20) -> List[ContributorModel]:
        payload = self._request_list(
            f"https://api.github.com/repos/{full_name}/contributors",
            params={"per_page": str(limit)},
        )
        contributors = []
        for item in payload:
            contributors.append(
                ContributorModel(
                    login=item["login"],
                    avatar_url=item["avatar_url"],
                    html_url=item["html_url"],
                    contributions=item.get("contributions", 0),
                    installed_in_gittok=False,
                )
            )
        return contributors

    def fetch_issues(
        self, full_name: str, limit: int = 10
    ) -> List[IssueModel]:
        """Fetch open issues, prioritizing 'good first issue' and 'help wanted'."""
        payload = self._request_list(
            f"https://api.github.com/repos/{full_name}/issues",
            params={
                "state": "open",
                "sort": "created",
                "direction": "desc",
                "per_page": str(limit),
            },
        )
        issues = []
        for item in payload:
            # Skip pull requests (GitHub returns them in /issues too)
            if "pull_request" in item:
                continue
            labels = [lbl["name"] for lbl in item.get("labels", []) if isinstance(lbl, dict)]
            issues.append(
                IssueModel(
                    number=item["number"],
                    title=item["title"],
                    labels=labels,
                    created_at=item.get("created_at", ""),
                    html_url=item["html_url"],
                )
            )
        # Sort: "good first issue" and "help wanted" labels float to the top
        priority_labels = {"good first issue", "help wanted", "beginner", "easy"}
        issues.sort(
            key=lambda i: (
                0 if priority_labels.intersection(set(l.lower() for l in i.labels)) else 1,
                i.number * -1,
            )
        )
        return issues[:limit]

    def fetch_readme_text(self, full_name: str) -> str:
        owner, repo = full_name.split("/", 1)
        candidates = [
            f"https://raw.githubusercontent.com/{owner}/{repo}/main/README.md",
            f"https://raw.githubusercontent.com/{owner}/{repo}/master/README.md",
            f"https://raw.githubusercontent.com/{owner}/{repo}/main/readme.md",
        ]
        with httpx.Client(timeout=20.0) as client:
            for candidate in candidates:
                try:
                    response = client.get(candidate)
                    if response.is_success:
                        return response.text
                except httpx.HTTPError:
                    continue
        return ""


def normalize_repo(payload: Dict) -> RepositoryModel:
    owner = payload.get("owner") or {}
    topics = payload.get("topics") or []
    if isinstance(topics, str):
        topics = re.split(r"[\s,]+", topics)
    return RepositoryModel.model_validate(
        {
            "id": payload["id"],
            "name": payload["name"],
            "full_name": payload["full_name"],
            "description": payload.get("description"),
            "html_url": payload["html_url"],
            "stargazers_count": payload.get("stargazers_count", 0),
            "forks_count": payload.get("forks_count", 0),
            "language": payload.get("language"),
            "owner": {
                "login": owner.get("login", ""),
                "avatar_url": owner.get("avatar_url", ""),
                "html_url": owner.get("html_url", ""),
            },
            "topics": [topic for topic in topics if topic],
            "created_at": payload.get("created_at") or payload.get("pushed_at") or "",
            "updated_at": payload.get("updated_at") or payload.get("pushed_at") or "",
            "homepage": payload.get("homepage"),
            "open_issues_count": payload.get("open_issues_count", 0),
            "watchers_count": payload.get("watchers_count", payload.get("stargazers_count", 0)),
            "fork": payload.get("fork", False),
        }
    )
