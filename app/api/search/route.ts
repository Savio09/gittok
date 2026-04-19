import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");
  const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "30") || 30, 1), 100);

  if (!query) {
    return NextResponse.json({ error: "Query parameter 'q' is required" }, { status: 400 });
  }

  if (query.length > 256) {
    return NextResponse.json({ error: "Query too long (max 256 characters)" }, { status: 400 });
  }

  try {
    const backendSearch = new URLSearchParams({
      q: query,
      limit: String(limit),
    });
    const response = await backendFetch(`/api/search?${backendSearch.toString()}`);
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error searching repos:", error);
    return NextResponse.json(
      { error: "Failed to search repositories" },
      { status: 500 }
    );
  }
}
