import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    const { roomId, role } = await req.json();

    const API_KEY = process.env.VIDEOSDK_API_KEY!;
    const API_SECRET = process.env.VIDEOSDK_API_SECRET!;

    // Token expiry (e.g., 1 hour)
    const options = {
      expiresIn: 3600,
      algorithm: "HS256" as const,
    };

    const payload = {
      apikey: API_KEY,
      permissions: role === "doctor" ? ["allow_join", "allow_mod"] : ["allow_join"],
      meetingId: roomId,
    };

    const token = jwt.sign(payload, API_SECRET, options);

    return NextResponse.json({ token });
  } catch (error) {
    console.error("Token generation error:", error);
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to generate token", details: errorMsg },
      { status: 500 }
    );
  }
}