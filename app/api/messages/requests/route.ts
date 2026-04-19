import { NextRequest, NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const response = await backendFetch("/api/messages/requests", {
      method: "POST",
      body: JSON.stringify(body),
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error creating message request:", error);
    return NextResponse.json(
      { error: "Failed to create message request" },
      { status: 500 }
    );
  }
}
