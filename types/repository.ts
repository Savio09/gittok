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

