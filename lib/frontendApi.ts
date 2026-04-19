import { Repository, Slideshow } from "@/types/repository";

async function readJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed with status ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export async function fetchTrendingRepos(
  language?: string,
  limit: number = 30
): Promise<Repository[]> {
  const searchParams = new URLSearchParams();
  if (language) searchParams.set("language", language);
  searchParams.set("limit", String(limit));

  const response = await fetch(`/api/trending?${searchParams.toString()}`);
  const data = await readJson<{ repos?: Repository[] }>(response);
  return data.repos || [];
}

export async function searchReposApi(
  query: string,
  limit: number = 30
): Promise<Repository[]> {
  const searchParams = new URLSearchParams({
    q: query,
    limit: String(limit),
  });
  const response = await fetch(`/api/search?${searchParams.toString()}`);
  const data = await readJson<{ repos?: Repository[] }>(response);
  return data.repos || [];
}


export async function batchFetchRepos(
  repos: string[]
): Promise<Repository[]> {
  const response = await fetch("/api/repos/batch", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ repos }),
  });
  const data = await readJson<{ repos?: Repository[] }>(response);
  return data.repos || [];
}

export async function batchFetchSlideshows(
  repos: Repository[]
): Promise<Map<number, Slideshow>> {
  const response = await fetch("/api/slideshows/batch", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ repos }),
  });
  const data = await readJson<{ slideshows?: Slideshow[] }>(response);
  const map = new Map<number, Slideshow>();
  (data.slideshows || []).forEach((slideshow) => {
    map.set(slideshow.repoId, slideshow);
  });
  return map;
}

export async function fetchSlideVoiceoverAudio(
  text: string,
  voice?: string
): Promise<Blob> {
  const response = await fetch("/api/audio/speech", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text,
      ...(voice ? { voice } : {}),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Request failed with status ${response.status}`);
  }

  return response.blob();
}

export async function fetchRepoContributors(
  fullName: string
) {
  const [owner, repo] = fullName.split("/");
  const response = await fetch(`/api/repos/${owner}/${repo}/contributors`);
  return readJson<{
    contributors: Array<{
      login: string;
      avatar_url: string;
      html_url: string;
      contributions: number;
      installed_in_gittok: boolean;
    }>;
  }>(response);
}

export async function createMessageRequest(payload: {
  repoFullName: string;
  contributorGithubLogin: string;
  requesterGithubLogin?: string;
  requesterName: string;
  requesterEmail: string;
  interest: string;
  background: string;
  message: string;
}) {
  const response = await fetch("/api/messages/requests", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return readJson(response);
}
