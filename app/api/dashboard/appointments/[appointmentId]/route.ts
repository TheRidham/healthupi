import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type Params = { params: Promise<{ appointmentId: string }> };

const VALID_STATUSES = [
  "confirmed",
  "completed",
  "cancelled",
  "rescheduled",
] as const;

// PATCH /api/dashboard/appointments/[appointmentId]
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const supabase = await createClient();
    const { appointmentId } = await params;

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { status } = await req.json();

    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { success: false, error: "Invalid status" },
        { status: 400 },
      );
    }

    // Update only if this appointment belongs to the logged-in doctor
    const { data, error } = await supabase
      .from("appointments")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", appointmentId)
      .eq("doctor_id", user.id) // ownership check
      .select("id, status")
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 },
      );
    }

    if (!data) {
      return NextResponse.json(
        { success: false, error: "Appointment not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
