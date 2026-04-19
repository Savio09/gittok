import { NextRequest, NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const response = await backendFetch("/api/slideshows/batch", {
      method: "POST",
      body: JSON.stringify(body),
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error generating slideshows:", error);
    return NextResponse.json(
      { error: "Failed to generate slideshows" },
      { status: 500 }
    );
  }
}

