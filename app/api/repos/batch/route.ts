import { NextRequest, NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";

/**
 * POST /api/repos/batch
 * Thin proxy to the Python backend.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const response = await backendFetch("/api/repos/batch", {
      method: "POST",
      body: JSON.stringify(body),
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
}
