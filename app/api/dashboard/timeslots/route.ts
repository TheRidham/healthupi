import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// time_slots.doctor_id → doctor_profiles.user_id → auth.uid()
// No join needed — doctor_id IS the auth user id
async function getDoctorId(supabase: Awaited<ReturnType<typeof createClient>>) {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user.id;
}

// GET /api/dashboard/timeslots
export async function GET() {
  try {
    const supabase = await createClient();
    const doctorId = await getDoctorId(supabase);
    if (!doctorId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { data, error } = await supabase
      .from("time_slots")
      .select("*")
      .eq("doctor_id", doctorId)
      .order("day_of_week", { ascending: true })
      .order("start_time", { ascending: true });

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, data: data ?? [] });
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST /api/dashboard/timeslots — add a slot
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const doctorId = await getDoctorId(supabase);
    if (!doctorId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const {
      day_of_week,
      start_time,
      end_time,
      appointment_duration,
      is_available,
    } = await req.json();

    if (day_of_week == null || !start_time || !end_time) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Check for overlapping slots on same day
    const { data: existing } = await supabase
      .from("time_slots")
      .select("id")
      .eq("doctor_id", doctorId)
      .eq("day_of_week", day_of_week)
      .lt("start_time", end_time)
      .gt("end_time", start_time);

    if (existing?.length) {
      return NextResponse.json(
        { success: false, error: "This slot overlaps with an existing one" },
        { status: 409 },
      );
    }

    const { data, error } = await supabase
      .from("time_slots")
      .insert({
        doctor_id: doctorId,
        day_of_week,
        start_time,
        end_time,
        appointment_duration: appointment_duration ?? 30,
        is_available: is_available ?? true,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 },
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

// DELETE /api/dashboard/timeslots?slot_id=xxx
export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient();
    const doctorId = await getDoctorId(supabase);
    if (!doctorId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const slotId = new URL(req.url).searchParams.get("slot_id");
    if (!slotId) {
      return NextResponse.json(
        { success: false, error: "slot_id is required" },
        { status: 400 },
      );
    }

    // Enforce ownership — only delete if this slot belongs to this doctor
    const { error } = await supabase
      .from("time_slots")
      .delete()
      .eq("id", slotId)
      .eq("doctor_id", doctorId);

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
