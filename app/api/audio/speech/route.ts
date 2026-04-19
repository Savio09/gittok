import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";

export async function POST(request: Request) {
  let payload: { text?: unknown; voice?: unknown };

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const text = typeof payload.text === "string" ? payload.text.trim() : "";
  const voice = typeof payload.voice === "string" ? payload.voice.trim() : "";

  if (!text) {
    return NextResponse.json({ error: "text is required" }, { status: 400 });
  }

  if (text.length > 4000) {
    return NextResponse.json({ error: "text is too long" }, { status: 400 });
  }

  try {
    const response = await backendFetch("/api/audio/speech", {
      method: "POST",
      body: JSON.stringify({
        text,
        ...(voice ? { voice } : {}),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new NextResponse(errorText, {
        status: response.status,
        headers: {
          "Content-Type": response.headers.get("Content-Type") ?? "application/json",
        },
      });
    }

    const audioBuffer = await response.arrayBuffer();
    return new NextResponse(audioBuffer, {
      status: response.status,
      headers: {
        "Cache-Control":
          response.headers.get("Cache-Control") ?? "private, max-age=0, must-revalidate",
        "Content-Type": response.headers.get("Content-Type") ?? "audio/mpeg",
      },
    });
  } catch (error) {
    console.error("Error generating speech audio:", error);
    return NextResponse.json(
      { error: "Failed to generate speech audio" },
      { status: 500 }
    );
  }
}
