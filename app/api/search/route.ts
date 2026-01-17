import { NextResponse } from "next/server";
import { searchRepos } from "@/lib/github";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");
  const limit = parseInt(searchParams.get("limit") || "30");

  if (!query) {
    return NextResponse.json(
      { error: "Query parameter 'q' is required" },
      { status: 400 }
    );
  }

  try {
    const repos = await searchRepos(query, limit);
    return NextResponse.json(repos);
  } catch (error) {
    console.error("Error searching repos:", error);
    return NextResponse.json(
      { error: "Failed to search repositories" },
      { status: 500 }
    );
  }
}

