import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/dashboard/appointments
// Returns { today: [...], upcoming: [...] }
export async function GET() {
  try {
    const supabase = await createClient();

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

    const todayISO = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"

    // Fetch today's appointments
    const { data: todayData, error: todayError } = await supabase
      .from("appointments")
      .select(
        `
        id,
        appointment_date,
        start_time,
        end_time,
        status,
        payment_status,
        notes,
        patient_profiles!fk_appointments_patient (
          name,
          email,
          phone
        ),
        services!fk_appointments_service (
          name,
          type,
          duration_minutes
        )
      `,
      )
      .eq("doctor_id", user.id)
      .eq("appointment_date", todayISO)
      .not("status", "eq", "cancelled")
      .order("start_time", { ascending: true });

    if (todayError) throw todayError;

    // Fetch upcoming appointments (from tomorrow onwards, next 7 days)
    const tomorrowISO = new Date(Date.now() + 86400000)
      .toISOString()
      .split("T")[0];
    const thirtyDaysISO = new Date(Date.now() + 7 * 86400000)
      .toISOString()
      .split("T")[0];

    const { data: upcomingData, error: upcomingError } = await supabase
      .from("appointments")
      .select(
        `
        id,
        appointment_date,
        start_time,
        end_time,
        status,
        payment_status,
        notes,
        patient_profiles!fk_appointments_patient (
          name,
          email,
          phone
        ),
        services!fk_appointments_service (
          name,
          type,
          duration_minutes
        )
      `,
      )
      .eq("doctor_id", user.id)
      .gte("appointment_date", tomorrowISO)
      .lte("appointment_date", thirtyDaysISO)
      .not("status", "eq", "cancelled")
      .order("appointment_date", { ascending: true })
      .order("start_time", { ascending: true });

    if (upcomingError) throw upcomingError;

    const mapRow = (row: any) => ({
      id: row.id,
      appointment_date: row.appointment_date,
      start_time: row.start_time,
      end_time: row.end_time,
      status: row.status,
      payment_status: row.payment_status,
      notes: row.notes,
      patient: {
        name: row.patient_profiles?.name ?? null,
        email: row.patient_profiles?.email ?? null,
        phone: row.patient_profiles?.phone ?? null,
        photo_url: row.patient_profiles?.photo_url ?? null,
      },
      service: {
        name: row.services?.name ?? "Unknown Service",
        type: row.services?.type ?? "",
        duration_minutes: row.services?.duration_minutes ?? null,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        today: (todayData ?? []).map(mapRow),
        upcoming: (upcomingData ?? []).map(mapRow),
      },
    });
  } catch (err: any) {
    console.error("[/api/dashboard/appointments]", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
