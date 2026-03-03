import { NextResponse } from "next/server";
import { validateMeeting } from "@/modules/meeting/services/meeting.service";
import { getServerSession } from "@/lib/supabase-server";

export async function POST(req: Request) {
  try {
    const { appointmentId } = await req.json();

    if (!appointmentId) {
      return NextResponse.json(
        { error: "Missing appointmentId" },
        { status: 400 }
      );
    }

    // Get authenticated user from Supabase server session
    const user = await getServerSession();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized - Please login first" },
        { status: 401 }
      );
    }

    const data = await validateMeeting(appointmentId, user.id);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Meeting validation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Meeting not found" },
      { status: 404 }
    );
  }
}