export interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  owner: {
    login: string;
    avatar_url: string;
    html_url: string;
  };
  topics: string[];
  created_at: string;
  updated_at: string;
  homepage: string | null;
  open_issues_count: number;
  watchers_count: number;
}

export type SlideType =
  | "intro"
  | "overview"
  | "features"
  | "stats"
  | "issues"
  | "topics"
  | "cta";

export interface Issue {
  number: number;
  title: string;
  labels: string[];
  html_url: string;
}

export interface Slide {
  type: SlideType;
  duration: number;
  transcript: string;
  features?: string[];
  issues?: Issue[];
}

export interface Slideshow {
  repoId: number;
  slides: Slide[];
  voice?: string;
}

export interface FeedItem {
  type: "starred" | "forked" | "created" | "trending" | "contributed";
  repo: Repository;
  actor?: {
    login: string;
    avatar_url: string;
    html_url: string;
  };
  timestamp: string;
  reason: string;
}
