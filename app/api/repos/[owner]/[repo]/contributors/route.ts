import { NextRequest, NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ owner: string; repo: string }> }
) {
  const { owner, repo } = await params;
  const { searchParams } = new URL(request.url);
  const limit = searchParams.get("limit");
  const suffix = limit ? `?limit=${encodeURIComponent(limit)}` : "";

  try {
    const response = await backendFetch(`/api/repos/${owner}/${repo}/contributors${suffix}`);
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error fetching contributors:", error);
    return NextResponse.json(
      { error: "Failed to fetch contributors" },
      { status: 500 }
    );
  }
}

