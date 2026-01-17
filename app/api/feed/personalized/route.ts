import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { getHybridFeed, getPersonalizedFeed, getNetworkActivityFeed, getInfiniteFeed, getExtendedNetworkFeed } from "@/lib/personalizedFeed";
import { fetchTrendingRepos } from "@/lib/github";

// Helper to return trending repos
async function getTrendingFeedResponse() {
  const trending = await fetchTrendingRepos();
  return NextResponse.json({
    items: trending.map((repo) => ({
      type: "trending",
      repo,
      reason: "Trending on GitHub",
      timestamp: new Date().toISOString(),
    })),
    source: "trending",
  });
}

export async function GET(request: NextRequest) {
  try {
    // Get pagination params from query string
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");
    
    // Check auth - but don't require it for trending
    let userId: string | null = null;
    try {
      const authResult = await auth();
      userId = authResult.userId;
      console.log("Auth result - userId:", userId, "page:", page);
    } catch (authError) {
      console.log("Auth check failed, continuing with trending:", authError);
      return getTrendingFeedResponse();
    }

    // If not logged in, return trending repos
    if (!userId) {
      console.log("No user session, returning trending repos");
      return getTrendingFeedResponse();
    }

    // Try to get user info from Clerk
    let user;
    try {
      const client = await clerkClient();
      user = await client.users.getUser(userId);
      console.log("Clerk user found:", user.id);
      console.log("External accounts:", user.externalAccounts?.map((a: any) => ({
        provider: a.provider,
        username: a.username,
      })));
    } catch (userError) {
      console.error("Could not get user from Clerk:", userError);
      return getTrendingFeedResponse();
    }

    // Find GitHub OAuth account
    const githubAccount = user.externalAccounts?.find(
      (account: any) => account.provider === "oauth_github"
    );

    if (!githubAccount) {
      console.log("No GitHub account linked to this user");
      console.log("Available providers:", user.externalAccounts?.map((a: any) => a.provider));
      return NextResponse.json({
        items: (await fetchTrendingRepos()).map((repo) => ({
          type: "trending",
          repo,
          reason: "Trending on GitHub - Link your GitHub account for personalized feed",
          timestamp: new Date().toISOString(),
        })),
        source: "trending",
        message: "No GitHub account linked. Please sign out and sign in with GitHub to get personalized feeds.",
      });
    }

    // Get GitHub username
    const githubUsername = githubAccount.username;
    console.log("GitHub username:", githubUsername);

    // Try to get the OAuth token from Clerk
    let accessToken: string | null = null;
    try {
      const client = await clerkClient();
      console.log("Attempting to get OAuth token for user:", userId);
      
      // Use "github" instead of "oauth_github" (deprecated)
      const oauthTokens = await client.users.getUserOauthAccessToken(
        userId,
        "github"
      );
      
      console.log("OAuth tokens response:", {
        hasData: !!oauthTokens?.data,
        dataLength: oauthTokens?.data?.length || 0,
        firstToken: oauthTokens?.data?.[0] ? {
          hasToken: !!oauthTokens.data[0].token,
          tokenLength: oauthTokens.data[0].token?.length || 0,
          scopes: oauthTokens.data[0].scopes,
        } : null,
      });
      
      accessToken = oauthTokens?.data?.[0]?.token || null;
      
      if (!accessToken) {
        console.log("No access token found in Clerk OAuth response");
        console.log("This usually means GitHub OAuth scopes are not configured in Clerk Dashboard");
        console.log("Go to Clerk Dashboard -> User & Authentication -> Social Connections -> GitHub");
        console.log("Enable 'Use custom credentials' and add scopes: read:user, user:follow, public_repo");
      }
    } catch (tokenError: any) {
      console.error("Could not get OAuth token from Clerk:", tokenError?.message || tokenError);
      console.error("Full error:", JSON.stringify(tokenError, null, 2));
    }

    // If we have the token, try to fetch personalized feed
    if (accessToken && githubUsername) {
      console.log(`Fetching personalized feed for ${githubUsername} with token length: ${accessToken.length}, page: ${page}`);

      try {
        // Use infinite feed for pagination support
        const { items: feedItems, hasMore, nextPage } = await getInfiniteFeed(
          accessToken, 
          githubUsername, 
          page, 
          pageSize
        );
        console.log(`Got ${feedItems.length} items from infinite feed (page ${page}), hasMore: ${hasMore}`);

        if (feedItems.length > 0) {
          return NextResponse.json({
            items: feedItems,
            source: "personalized",
            username: githubUsername,
            pagination: {
              page,
              pageSize,
              hasMore,
              nextPage,
            },
          });
        } else if (page === 1) {
          console.log("Infinite feed returned 0 items on first page, trying alternatives...");
          
          // Try getting just network activity
          try {
            const activityItems = await getNetworkActivityFeed(accessToken, 30);
            if (activityItems.length > 0) {
              return NextResponse.json({
                items: activityItems,
                source: "personalized",
                username: githubUsername,
                pagination: { page: 1, hasMore: false, nextPage: 1 },
              });
            }
          } catch (activityError) {
            console.error("Network activity feed also failed:", activityError);
          }
        } else {
          // No more items on subsequent pages
          return NextResponse.json({
            items: [],
            source: "personalized",
            username: githubUsername,
            pagination: { page, hasMore: false, nextPage: page },
            message: "You've reached the end of your feed!",
          });
        }
      } catch (feedError: any) {
        console.error("Error getting infinite feed:", feedError?.message || feedError);
        
        // Check if it's a GitHub API error
        if (feedError?.status === 401) {
          console.log("GitHub API returned 401 - token may be invalid or expired");
        } else if (feedError?.status === 403) {
          console.log("GitHub API returned 403 - rate limited or insufficient permissions");
        }
      }
    } else {
      // No token available - provide helpful message
      const message = !accessToken 
        ? "GitHub OAuth token not available. Configure GitHub OAuth scopes in Clerk Dashboard."
        : "GitHub username not found.";
      
      console.log(message);
      
      return NextResponse.json({
        items: (await fetchTrendingRepos()).map((repo) => ({
          type: "trending",
          repo,
          reason: "Trending on GitHub",
          timestamp: new Date().toISOString(),
        })),
        source: "trending",
        username: githubUsername,
        message: message,
        debug: {
          hasToken: !!accessToken,
          hasUsername: !!githubUsername,
          userId: userId,
        }
      });
    }

    // Fallback to trending
    console.log("Falling back to trending repos (personalized feed had no items)");
    return NextResponse.json({
      items: (await fetchTrendingRepos()).map((repo) => ({
        type: "trending",
        repo,
        reason: "Trending on GitHub",
        timestamp: new Date().toISOString(),
      })),
      source: "trending",
      username: githubUsername,
      message: "Your network has no recent activity. Showing trending repos instead.",
    });
  } catch (error) {
    console.error("Error fetching personalized feed:", error);

    // Last resort - try to return trending even on error
    try {
      const trending = await fetchTrendingRepos();
      return NextResponse.json({
        items: trending.map((repo) => ({
          type: "trending",
          repo,
          reason: "Trending on GitHub",
          timestamp: new Date().toISOString(),
        })),
        source: "trending",
      });
    } catch (finalError) {
      console.error("Even trending failed:", finalError);
      return NextResponse.json(
        { error: "Failed to fetch feed", details: String(error) },
        { status: 500 }
      );
    }
  }
}
