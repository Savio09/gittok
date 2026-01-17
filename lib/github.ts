import { Octokit } from "octokit";
import { Repository } from "@/types/repository";

// Initialize Octokit - you can add a token for higher rate limits
const octokit = new Octokit({
  auth: process.env.NEXT_PUBLIC_GITHUB_TOKEN,
});

export async function fetchTrendingRepos(
  language?: string,
  limit: number = 30
): Promise<Repository[]> {
  try {
    // Calculate date for last week
    const date = new Date();
    date.setDate(date.getDate() - 7);
    const lastWeek = date.toISOString().split("T")[0];

    // Search for trending repos
    const { data } = await octokit.rest.search.repos({
      q: `created:>${lastWeek}${language ? ` language:${language}` : ""} stars:>50`,
      sort: "stars",
      order: "desc",
      per_page: limit,
    });

    return data.items as Repository[];
  } catch (error) {
    console.error("Error fetching trending repos:", error);
    // Return mock data for development
    return getMockRepos();
  }
}

export async function fetchUserFollowingForkedRepos(
  username: string
): Promise<Repository[]> {
  try {
    // Get users that the given user follows
    const { data: following } = await octokit.rest.users.listFollowingForUser({
      username,
      per_page: 20,
    });

    // Get repos forked by those users
    const allRepos: Repository[] = [];
    
    for (const user of following) {
      const { data: repos } = await octokit.rest.repos.listForUser({
        username: user.login,
        type: "all",
        per_page: 10,
      });

      const forkedRepos = repos.filter((repo: any) => repo.fork);
      allRepos.push(...(forkedRepos as Repository[]));
    }

    // Sort by stars and return unique repos
    return allRepos
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
      .slice(0, 30);
  } catch (error) {
    console.error("Error fetching following forked repos:", error);
    return [];
  }
}

export async function searchRepos(query: string, limit: number = 30): Promise<Repository[]> {
  try {
    const { data } = await octokit.rest.search.repos({
      q: query,
      sort: "stars",
      order: "desc",
      per_page: limit,
    });

    return data.items as Repository[];
  } catch (error) {
    console.error("Error searching repos:", error);
    return [];
  }
}

// Mock data for development without API token
function getMockRepos(): Repository[] {
  return [
    {
      id: 1,
      name: "awesome-project",
      full_name: "user/awesome-project",
      description: "An amazing project that does incredible things with AI and machine learning",
      html_url: "https://github.com/user/awesome-project",
      stargazers_count: 15420,
      forks_count: 2340,
      language: "TypeScript",
      owner: {
        login: "developer",
        avatar_url: "https://avatars.githubusercontent.com/u/1?v=4",
        html_url: "https://github.com/developer",
      },
      topics: ["ai", "machine-learning", "typescript"],
      created_at: "2023-01-15T12:00:00Z",
      updated_at: "2024-12-30T12:00:00Z",
      homepage: "https://awesome-project.dev",
      open_issues_count: 42,
      watchers_count: 15420,
    },
    {
      id: 2,
      name: "next-gen-framework",
      full_name: "org/next-gen-framework",
      description: "The next generation web framework built for speed and developer experience",
      html_url: "https://github.com/org/next-gen-framework",
      stargazers_count: 28900,
      forks_count: 3420,
      language: "JavaScript",
      owner: {
        login: "org",
        avatar_url: "https://avatars.githubusercontent.com/u/2?v=4",
        html_url: "https://github.com/org",
      },
      topics: ["framework", "web", "performance"],
      created_at: "2023-03-20T12:00:00Z",
      updated_at: "2024-12-29T12:00:00Z",
      homepage: "https://nextgen.dev",
      open_issues_count: 89,
      watchers_count: 28900,
    },
    {
      id: 3,
      name: "rust-blockchain",
      full_name: "crypto/rust-blockchain",
      description: "High-performance blockchain implementation in Rust with zero-knowledge proofs",
      html_url: "https://github.com/crypto/rust-blockchain",
      stargazers_count: 9876,
      forks_count: 1234,
      language: "Rust",
      owner: {
        login: "crypto",
        avatar_url: "https://avatars.githubusercontent.com/u/3?v=4",
        html_url: "https://github.com/crypto",
      },
      topics: ["blockchain", "rust", "crypto", "zk-proofs"],
      created_at: "2023-06-10T12:00:00Z",
      updated_at: "2024-12-28T12:00:00Z",
      homepage: null,
      open_issues_count: 23,
      watchers_count: 9876,
    },
  ];
}

