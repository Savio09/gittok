from typing import Any, Dict, List, Optional

from pydantic import BaseModel, ConfigDict, Field


class RepositoryOwner(BaseModel):
    login: str
    avatar_url: str
    html_url: str


class RepositoryModel(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: int
    name: str
    full_name: str
    description: Optional[str] = None
    html_url: str
    stargazers_count: int = 0
    forks_count: int = 0
    language: Optional[str] = None
    owner: RepositoryOwner
    topics: List[str] = Field(default_factory=list)
    created_at: str
    updated_at: str
    homepage: Optional[str] = None
    open_issues_count: int = 0
    watchers_count: int = 0
    fork: bool = False


class FeedActor(BaseModel):
    login: str
    avatar_url: str
    html_url: str


class FeedItem(BaseModel):
    type: str
    repo: RepositoryModel
    actor: Optional[FeedActor] = None
    timestamp: str
    reason: str
    connection_degree: Optional[int] = Field(default=None, alias="connectionDegree")

    model_config = ConfigDict(populate_by_name=True)


class RepoListResponse(BaseModel):
    repos: List[RepositoryModel]


class RepoBatchRequest(BaseModel):
    repos: List[str]


class PersonalizedFeedRequest(BaseModel):
    github_username: str = Field(alias="githubUsername")
    github_token: str = Field(alias="githubToken")
    page: int = 1
    page_size: int = Field(default=20, alias="pageSize")

    model_config = ConfigDict(populate_by_name=True)


class IssueModel(BaseModel):
    number: int
    title: str
    labels: List[str] = Field(default_factory=list)
    created_at: str = ""
    html_url: str = ""


class Slide(BaseModel):
    type: str
    duration: float
    transcript: str
    features: Optional[List[str]] = None
    issues: Optional[List[IssueModel]] = None


class Slideshow(BaseModel):
    repo_id: int = Field(alias="repoId")
    slides: List[Slide]
    voice: Optional[str] = None

    model_config = ConfigDict(populate_by_name=True)


class SlideshowBatchRequest(BaseModel):
    repos: List[RepositoryModel]


class SlideshowBatchResponse(BaseModel):
    slideshows: List[Slideshow]


class SpeechAudioRequest(BaseModel):
    text: str = Field(min_length=1, max_length=4000)
    voice: Optional[str] = Field(default=None, min_length=1, max_length=64)


class ContributorModel(BaseModel):
    login: str
    avatar_url: str
    html_url: str
    contributions: int = 0
    installed_in_gittok: bool = False


class ContributorListResponse(BaseModel):
    contributors: List[ContributorModel]


class MessageRequestCreate(BaseModel):
    repo_full_name: str = Field(alias="repoFullName")
    contributor_github_login: str = Field(alias="contributorGithubLogin")
    requester_github_login: Optional[str] = Field(default=None, alias="requesterGithubLogin")
    requester_name: str = Field(alias="requesterName")
    requester_email: str = Field(alias="requesterEmail")
    interest: str
    background: str
    message: str

    model_config = ConfigDict(populate_by_name=True)


class MessageRequestOut(BaseModel):
    id: str
    repo_full_name: str = Field(alias="repoFullName")
    contributor_github_login: str = Field(alias="contributorGithubLogin")
    requester_github_login: Optional[str] = Field(default=None, alias="requesterGithubLogin")
    requester_name: str = Field(alias="requesterName")
    requester_email: str = Field(alias="requesterEmail")
    interest: str
    background: str
    message: str
    status: str
    created_at: str = Field(alias="createdAt")

    model_config = ConfigDict(populate_by_name=True)


class MessageRequestResponse(BaseModel):
    request: MessageRequestOut
