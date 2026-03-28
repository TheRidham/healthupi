import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const supabase = await createClient();
    const { conversationId } = await params;

    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // First, get the conversation to find the appointment_id
    const { data: conversation, error: convError } = await supabase
      .from("conversations")
      .select("appointment_id")
      .eq("id", conversationId)
      .single();

    if (convError || !conversation || !conversation.appointment_id) {
      return NextResponse.json(
        { success: false, error: "Conversation not found" },
        { status: 404 }
      );
    }

    // Now fetch the appointment details using the appointment_id
    const { data: appointment, error } = await supabase
      .from("appointments")
      .select("id, appointment_date, start_time, doctor_id, patient_id")
      .eq("id", conversation.appointment_id)
      .single();

    if (error || !appointment) {
      return NextResponse.json(
        { success: false, error: "Appointment not found" },
        { status: 404 }
      );
    }

    // Verify user is either doctor or patient in this appointment
    if (appointment.doctor_id !== user.id && appointment.patient_id !== user.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access to this appointment" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      appointment: {
        id: appointment.id,
        appointment_date: appointment.appointment_date,
        start_time: appointment.start_time,
      },
    });
  } catch (error) {
    console.error("Error fetching appointment:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
