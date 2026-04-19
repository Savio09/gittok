import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const language = searchParams.get("language") || undefined;
  const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "30") || 30, 1), 100);

  // Basic language validation (alphanumeric, plus, hash, dash only)
  if (language && !/^[\w+#-]+$/.test(language)) {
    return NextResponse.json({ error: "Invalid language parameter" }, { status: 400 });
  }

  try {
    const backendSearch = new URLSearchParams();
    if (language) backendSearch.set("language", language);
    backendSearch.set("limit", String(limit));

    const response = await backendFetch(`/api/trending?${backendSearch.toString()}`);
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error fetching trending repos:", error);
    return NextResponse.json(
      { error: "Failed to fetch trending repositories" },
      { status: 500 }
    );
  }
}
