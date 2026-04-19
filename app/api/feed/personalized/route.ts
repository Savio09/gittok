import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { backendFetch } from "@/lib/backend";
import { Repository } from "@/types/repository";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function trendingFallback(message?: string) {
  const response = await backendFetch("/api/trending?limit=30");
  const data = await response.json();
  const trending: Repository[] = data.repos || [];
  return NextResponse.json({
    items: trending.map((repo: Repository) => ({
      type: "trending",
      repo,
      reason: message ?? "Trending on GitHub",
      timestamp: new Date().toISOString(),
    })),
    source: "trending",
  });
}

// ---------------------------------------------------------------------------
// GET /api/feed/personalized
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = Math.min(Math.max(parseInt(searchParams.get("page") || "1") || 1, 1), 100);
    const pageSize = Math.min(Math.max(parseInt(searchParams.get("pageSize") || "20") || 20, 1), 50);

    // Auth — optional; if not logged in we show trending
    let userId: string | null = null;
    try {
      const authResult = await auth();
      userId = authResult.userId;
    } catch {
      return trendingFallback();
    }

    if (!userId) return trendingFallback();

    // Get user from Clerk
    let user;
    try {
      const client = await clerkClient();
      user = await client.users.getUser(userId);
    } catch {
      return trendingFallback();
    }

    // Find GitHub OAuth account
    const githubAccount = user.externalAccounts?.find(
      (account: any) => account.provider === "oauth_github"
    );

    if (!githubAccount) {
      const response = await backendFetch("/api/trending?limit=30");
      const data = await response.json();
      return NextResponse.json({
        items: (data.repos || []).map((repo: any) => ({
          type: "trending",
          repo,
          reason: "Trending — link your GitHub account for a personalised feed",
          timestamp: new Date().toISOString(),
        })),
        source: "trending",
        message:
          "No GitHub account linked. Sign in with GitHub for personalised feeds.",
      });
    }

    const githubUsername = githubAccount.username;

    // Retrieve GitHub OAuth token
    let accessToken: string | null = null;
    try {
      const client = await clerkClient();
      const oauthTokens = await client.users.getUserOauthAccessToken(
        userId,
        "github"
      );
      accessToken = oauthTokens?.data?.[0]?.token || null;
    } catch (err) {
      console.error("OAuth token retrieval failed:", err);
    }

    if (!accessToken || !githubUsername) {
      return trendingFallback(
        accessToken
          ? "Trending on GitHub"
          : "Trending — configure GitHub OAuth scopes in Clerk Dashboard"
      );
    }

    // Fetch personalised feed
    try {
      const response = await backendFetch("/api/feed/personalized", {
        method: "POST",
        body: JSON.stringify({
          githubUsername,
          githubToken: accessToken,
          page,
          pageSize,
        }),
      });
      const data = await response.json();

      if (response.ok && (data.items || []).length > 0) {
        return NextResponse.json({
          ...data,
          source: data.source || "personalized",
          username: githubUsername,
        });
      }

      // End of feed
      if (page > 1) {
        return NextResponse.json({
          items: [],
          source: "personalized",
          username: githubUsername,
          pagination: { page, hasMore: false, nextPage: page },
        });
      }
    } catch (feedError: any) {
      console.error("Personalised feed error:", feedError?.message);
    }

    // Final fallback
    return trendingFallback(
      "Your network has no recent activity — showing trending instead."
    );
  } catch (error) {
    console.error("Feed route error:", error);
    try {
      return trendingFallback();
    } catch {
      return NextResponse.json(
        { error: "Failed to fetch feed" },
        { status: 500 }
      );
    }
  }
}
