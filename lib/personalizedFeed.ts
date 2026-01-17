import { Octokit } from "octokit";
import { Repository } from "@/types/repository";

/**
 * Personalized Feed Service
 * Creates custom feeds based on user's GitHub social graph
 */

export interface FeedItem {
  type: "starred" | "forked" | "created" | "trending" | "contributed";
  repo: Repository;
  actor?: {
    login: string;
    avatar_url: string;
    html_url: string;
  };
  timestamp: string;
  reason: string; // Why this is in the feed
}

/**
 * Get personalized feed for authenticated user
 * Shows repos from people they follow
 */
export async function getPersonalizedFeed(
  accessToken: string,
  username: string,
  limit: number = 30
): Promise<FeedItem[]> {
  const octokit = new Octokit({ auth: accessToken });
  const feedItems: FeedItem[] = [];

  try {
    // 1. Get users that the authenticated user follows
    // Use listFollowingForUser with the username instead of listFollowingForAuthenticatedUser
    const { data: following } = await octokit.rest.users.listFollowingForUser({
      username: username,
      per_page: 50,
    });

    console.log(`Found ${following.length} users that ${username} follows`);

    // 2. For each followed user, get their recent activity
    const activityPromises = following.slice(0, 20).map(async (user) => {
      try {
        // Get repos they've starred recently
        const { data: starred } = await octokit.rest.activity.listReposStarredByUser({
          username: user.login,
          per_page: 5,
          sort: "created",
          direction: "desc",
        });

        return starred.map((repo) => ({
          type: "starred" as const,
          repo: repo as Repository,
          actor: {
            login: user.login,
            avatar_url: user.avatar_url,
            html_url: user.html_url,
          },
          timestamp: new Date().toISOString(),
          reason: `${user.login} starred this`,
        }));
      } catch (error) {
        console.error(`Error fetching stars for ${user.login}:`, error);
        return [];
      }
    });

    const allActivity = await Promise.all(activityPromises);
    feedItems.push(...allActivity.flat());

    // 3. Get repos created by people you follow
    const repoPromises = following.slice(0, 15).map(async (user) => {
      try {
        const { data: repos } = await octokit.rest.repos.listForUser({
          username: user.login,
          sort: "created",
          direction: "desc",
          per_page: 3,
        });

        return repos
          .filter((repo) => !repo.fork)
          .map((repo) => ({
            type: "created" as const,
            repo: repo as Repository,
            actor: {
              login: user.login,
              avatar_url: user.avatar_url,
              html_url: user.html_url,
            },
            timestamp: repo.created_at || new Date().toISOString(),
            reason: `${user.login} created this`,
          }));
      } catch (error) {
        console.error(`Error fetching repos for ${user.login}:`, error);
        return [];
      }
    });

    const allRepos = await Promise.all(repoPromises);
    feedItems.push(...allRepos.flat());

    // 4. Sort by stars and recency
    feedItems.sort((a, b) => {
      const starsA = a.repo.stargazers_count || 0;
      const starsB = b.repo.stargazers_count || 0;
      return starsB - starsA;
    });

    // 5. Remove duplicates
    const seen = new Set<number>();
    const uniqueItems = feedItems.filter((item) => {
      if (seen.has(item.repo.id)) return false;
      seen.add(item.repo.id);
      return true;
    });

    return uniqueItems.slice(0, limit);
  } catch (error) {
    console.error("Error generating personalized feed:", error);
    return [];
  }
}

/**
 * Get activity feed - what's happening in your network
 */
export async function getNetworkActivityFeed(
  accessToken: string,
  limit: number = 30
): Promise<FeedItem[]> {
  const octokit = new Octokit({ auth: accessToken });
  const feedItems: FeedItem[] = [];

  try {
    // Get received events (activity from people you follow)
    const { data: events } = await octokit.rest.activity.listReceivedEventsForUser({
      username: "authenticated",
      per_page: 100,
    });

    for (const event of events) {
      try {
        // @ts-ignore
        if (event.type === "WatchEvent" && event.repo) {
          // Someone starred a repo
          // @ts-ignore
          const { data: repo } = await octokit.rest.repos.get({
            // @ts-ignore
            owner: event.repo.name.split("/")[0],
            // @ts-ignore
            repo: event.repo.name.split("/")[1],
          });

          feedItems.push({
            type: "starred",
            repo: repo as Repository,
            actor: {
              // @ts-ignore
              login: event.actor.login,
              // @ts-ignore
              avatar_url: event.actor.avatar_url,
              // @ts-ignore
              html_url: `https://github.com/${event.actor.login}`,
            },
            // @ts-ignore
            timestamp: event.created_at,
            // @ts-ignore
            reason: `${event.actor.login} starred this`,
          });
        }
        // @ts-ignore
        if (event.type === "ForkEvent" && event.repo) {
          // @ts-ignore
          const { data: repo } = await octokit.rest.repos.get({
            // @ts-ignore
            owner: event.repo.name.split("/")[0],
            // @ts-ignore
            repo: event.repo.name.split("/")[1],
          });

          feedItems.push({
            type: "forked",
            repo: repo as Repository,
            actor: {
              // @ts-ignore
              login: event.actor.login,
              // @ts-ignore
              avatar_url: event.actor.avatar_url,
              // @ts-ignore
              html_url: `https://github.com/${event.actor.login}`,
            },
            // @ts-ignore
            timestamp: event.created_at,
            // @ts-ignore
            reason: `${event.actor.login} forked this`,
          });
        }
      } catch (error) {
        // Skip repos we can't access
        continue;
      }
    }

    // Remove duplicates and sort
    const seen = new Set<number>();
    const uniqueItems = feedItems.filter((item) => {
      if (seen.has(item.repo.id)) return false;
      seen.add(item.repo.id);
      return true;
    });

    uniqueItems.sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return timeB - timeA;
    });

    return uniqueItems.slice(0, limit);
  } catch (error) {
    console.error("Error getting network activity:", error);
    return [];
  }
}

/**
 * Get trending repos among people you follow
 */
export async function getTrendingInNetwork(
  accessToken: string,
  username: string,
  limit: number = 30
): Promise<FeedItem[]> {
  const octokit = new Octokit({ auth: accessToken });
  const repoStarCounts = new Map<number, { repo: Repository; count: number; actors: any[] }>();

  try {
    // Use listFollowingForUser with the username instead of listFollowingForAuthenticatedUser
    const { data: following } = await octokit.rest.users.listFollowingForUser({
      username: username,
      per_page: 50,
    });

    // Check what repos multiple people in your network have starred
    const starPromises = following.map(async (user: any) => {
      try {
        const { data: starred } = await octokit.rest.activity.listReposStarredByUser({
          username: user.login,
          per_page: 10,
        });

        return { user, starred };
      } catch (error) {
        return { user, starred: [] };
      }
    });

    const allStars = await Promise.all(starPromises);

    allStars.forEach(({ user, starred }: { user: any; starred: any[] }) => {
      starred.forEach((repo: any) => {
        const existing = repoStarCounts.get(repo.id);
        if (existing) {
          existing.count++;
          existing.actors.push({
            login: user.login,
            avatar_url: user.avatar_url,
            html_url: user.html_url,
          });
        } else {
          repoStarCounts.set(repo.id, {
            repo: repo as Repository,
            count: 1,
            actors: [{
              login: user.login,
              avatar_url: user.avatar_url,
              html_url: user.html_url,
            }],
          });
        }
      });
    });

    // Convert to feed items, prioritize repos starred by multiple people
    const feedItems: FeedItem[] = Array.from(repoStarCounts.values())
      .filter((item) => item.count >= 2) // At least 2 people starred it
      .sort((a, b) => b.count - a.count)
      .map((item) => ({
        type: "trending" as const,
        repo: item.repo,
        actor: item.actors[0],
        timestamp: new Date().toISOString(),
        reason: `${item.count} people you follow starred this`,
      }));

    return feedItems.slice(0, limit);
  } catch (error) {
    console.error("Error getting trending in network:", error);
    return [];
  }
}

/**
 * Get extended network feed - repos from your network's network (2nd degree connections)
 * This creates an almost infinite feed by expanding to people your follows follow
 */
export async function getExtendedNetworkFeed(
  accessToken: string,
  username: string,
  limit: number = 50,
  offset: number = 0
): Promise<FeedItem[]> {
  const octokit = new Octokit({ auth: accessToken });
  const feedItems: FeedItem[] = [];
  const seenRepos = new Set<number>();

  try {
    // Get 1st degree - users you follow
    const { data: following } = await octokit.rest.users.listFollowingForUser({
      username: username,
      per_page: 30,
    });

    console.log(`Extended network: Found ${following.length} 1st degree connections`);

    // Get 2nd degree - users that your follows follow (network's network)
    const secondDegreeUsers: any[] = [];
    const secondDegreePromises = following.slice(0, 10).map(async (user) => {
      try {
        const { data: theirFollowing } = await octokit.rest.users.listFollowingForUser({
          username: user.login,
          per_page: 15,
        });
        return theirFollowing.map((u) => ({ 
          ...u, 
          connectedVia: user.login,
          connectedViaAvatar: user.avatar_url 
        }));
      } catch (error) {
        return [];
      }
    });

    const allSecondDegree = await Promise.all(secondDegreePromises);
    allSecondDegree.flat().forEach((user) => {
      // Don't include users you already follow or yourself
      if (!following.some((f) => f.login === user.login) && user.login !== username) {
        secondDegreeUsers.push(user);
      }
    });

    // Remove duplicates from 2nd degree
    const uniqueSecondDegree = Array.from(
      new Map(secondDegreeUsers.map((u) => [u.login, u])).values()
    ).slice(0, 30);

    console.log(`Extended network: Found ${uniqueSecondDegree.length} unique 2nd degree connections`);

    // Get activity from 2nd degree connections
    const activityPromises = uniqueSecondDegree.slice(offset, offset + 15).map(async (user) => {
      try {
        // Get repos they've starred
        const { data: starred } = await octokit.rest.activity.listReposStarredByUser({
          username: user.login,
          per_page: 5,
          sort: "created",
          direction: "desc",
        });

        return starred.map((repo) => ({
          type: "starred" as const,
          repo: repo as Repository,
          actor: {
            login: user.login,
            avatar_url: user.avatar_url,
            html_url: user.html_url,
          },
          timestamp: new Date().toISOString(),
          reason: `${user.login} starred this (via ${user.connectedVia})`,
          connectionDegree: 2,
        }));
      } catch (error) {
        return [];
      }
    });

    const secondDegreeActivity = await Promise.all(activityPromises);
    secondDegreeActivity.flat().forEach((item) => {
      if (!seenRepos.has(item.repo.id)) {
        seenRepos.add(item.repo.id);
        feedItems.push(item);
      }
    });

    // Also get repos created by 2nd degree connections
    const repoPromises = uniqueSecondDegree.slice(offset, offset + 10).map(async (user) => {
      try {
        const { data: repos } = await octokit.rest.repos.listForUser({
          username: user.login,
          sort: "updated",
          direction: "desc",
          per_page: 3,
        });

        return repos
          .filter((repo) => !repo.fork && (repo.stargazers_count || 0) > 5)
          .map((repo) => ({
            type: "created" as const,
            repo: repo as Repository,
            actor: {
              login: user.login,
              avatar_url: user.avatar_url,
              html_url: user.html_url,
            },
            timestamp: repo.created_at || new Date().toISOString(),
            reason: `Created by ${user.login} (via ${user.connectedVia})`,
            connectionDegree: 2,
          }));
      } catch (error) {
        return [];
      }
    });

    const secondDegreeRepos = await Promise.all(repoPromises);
    secondDegreeRepos.flat().forEach((item) => {
      if (!seenRepos.has(item.repo.id)) {
        seenRepos.add(item.repo.id);
        feedItems.push(item);
      }
    });

    // Sort by star count with some randomness for variety
    feedItems.sort((a, b) => {
      const starsA = a.repo.stargazers_count || 0;
      const starsB = b.repo.stargazers_count || 0;
      const randomFactor = (Math.random() - 0.5) * 100;
      return (starsB - starsA) + randomFactor;
    });

    return feedItems.slice(0, limit);
  } catch (error) {
    console.error("Error getting extended network feed:", error);
    return [];
  }
}

/**
 * Get infinite feed - combines all sources for endless scrolling
 * Prioritizes: 1st degree > 2nd degree > trending
 */
export async function getInfiniteFeed(
  accessToken: string,
  username: string,
  page: number = 1,
  pageSize: number = 20
): Promise<{ items: FeedItem[]; hasMore: boolean; nextPage: number }> {
  try {
    const offset = (page - 1) * pageSize;
    
    if (page === 1) {
      // First page: Mix of 1st degree content
      const [personalized, trending] = await Promise.all([
        getPersonalizedFeed(accessToken, username, 15),
        getTrendingInNetwork(accessToken, username, 10),
      ]);
      
      const items = [...trending, ...personalized];
      const seen = new Set<number>();
      const uniqueItems = items.filter((item) => {
        if (seen.has(item.repo.id)) return false;
        seen.add(item.repo.id);
        return true;
      });
      
      return {
        items: uniqueItems.slice(0, pageSize),
        hasMore: true,
        nextPage: 2,
      };
    } else {
      // Subsequent pages: Extended network (2nd degree)
      const extendedItems = await getExtendedNetworkFeed(
        accessToken,
        username,
        pageSize,
        offset - pageSize // Adjust offset for 2nd degree content
      );
      
      return {
        items: extendedItems,
        hasMore: extendedItems.length >= pageSize,
        nextPage: page + 1,
      };
    }
  } catch (error) {
    console.error("Error getting infinite feed:", error);
    return { items: [], hasMore: false, nextPage: page };
  }
}

/**
 * Get hybrid feed - mix of personalized and trending
 */
export async function getHybridFeed(
  accessToken: string,
  username: string,
  limit: number = 30
): Promise<FeedItem[]> {
  try {
    const [personalized, trending, activity, extended] = await Promise.all([
      getPersonalizedFeed(accessToken, username, 15),
      getTrendingInNetwork(accessToken, username, 10),
      getNetworkActivityFeed(accessToken, 10),
      getExtendedNetworkFeed(accessToken, username, 15, 0),
    ]);

    // Mix them together - prioritize 1st degree, then 2nd degree
    const allItems = [...trending, ...personalized, ...activity, ...extended];

    // Remove duplicates
    const seen = new Set<number>();
    const uniqueItems = allItems.filter((item) => {
      if (seen.has(item.repo.id)) return false;
      seen.add(item.repo.id);
      return true;
    });

    // Sort by engagement and connection degree
    uniqueItems.sort((a, b) => {
      const degreeA = (a as any).connectionDegree || 1;
      const degreeB = (b as any).connectionDegree || 1;
      const scoreA = (a.repo.stargazers_count || 0) + (a.type === "trending" ? 10000 : 0) + (degreeA === 1 ? 5000 : 0);
      const scoreB = (b.repo.stargazers_count || 0) + (b.type === "trending" ? 10000 : 0) + (degreeB === 1 ? 5000 : 0);
      return scoreB - scoreA;
    });

    return uniqueItems.slice(0, limit);
  } catch (error) {
    console.error("Error getting hybrid feed:", error);
    return [];
  }
}

