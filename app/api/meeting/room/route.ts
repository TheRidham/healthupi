import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    const { appointmentId } = await req.json();
    const supabase = await createClient();

    // Check if a room already exists for this appointment
    const { data: existingRoom } = await supabase
      .from("video_rooms")
      .select("room_id")
      .eq("appointment_id", appointmentId)
      .single();

    if (existingRoom) {
      return NextResponse.json({ roomId: existingRoom.room_id });
    }

    // Generate fresh token for this room creation request
    const API_KEY = process.env.VIDEOSDK_API_KEY!;
    const API_SECRET = process.env.VIDEOSDK_API_SECRET!;

    const token = jwt.sign(
      { apikey: API_KEY },
      API_SECRET,
      { expiresIn: 3600, algorithm: "HS256" as const }
    );

    // Create a new VideoSDK room
    const response = await fetch("https://api.videosdk.live/v2/rooms", {
      method: "POST",
      headers: {
        authorization: token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      throw new Error(`VideoSDK API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // VideoSDK returns room_id, not roomId
    const roomId = data.room_id || data.roomId;

    if (!roomId) {
      throw new Error("No room_id in VideoSDK response: " + JSON.stringify(data));
    }

    // Store in DB so the other participant gets the same room
    await supabase.from("video_rooms").insert({
      appointment_id: appointmentId,
      room_id: roomId,
    });

    return NextResponse.json({ roomId });
  } catch (error) {
    console.error("Room creation error:", error);
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to create room", details: errorMsg },
      { status: 500 }
    );
  }
}
