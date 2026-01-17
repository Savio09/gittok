import { NextResponse } from "next/server";
import { fetchTrendingRepos } from "@/lib/github";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const language = searchParams.get("language") || undefined;
  const limit = parseInt(searchParams.get("limit") || "30");

  try {
    const repos = await fetchTrendingRepos(language, limit);
    return NextResponse.json(repos);
  } catch (error) {
    console.error("Error fetching trending repos:", error);
    return NextResponse.json(
      { error: "Failed to fetch trending repositories" },
      { status: 500 }
    );
  }
}

