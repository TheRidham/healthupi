import { createClient } from "@/lib/supabase-server";

export async function validateMeeting(appointmentId: string, userId: string) {
  try {
    const supabase = await createClient();

    // Fetch appointment with doctor and patient details
    const { data: appointment, error: appointmentError } = await supabase
      .from("appointments")
      .select(
        `
        id,
        doctor_id,
        patient_id,
        appointment_date,
        start_time,
        status,
        doctor_profiles:doctor_id (
          id,
          first_name,
          last_name,
          title
        ),
        patient_profiles:patient_id (
          id,
          name
        )
      `
      )
      .eq("id", appointmentId)
      .single();

    if (appointmentError || !appointment) {
      console.log("DEBUG: ", appointmentError, "Appointment ID: ", appointmentId)
      throw new Error("Appointment not found");
    }

    // Check if appointment status allows joining
    if (appointment.status === "cancelled") {
      throw new Error("This appointment has been cancelled");
    }

    if (appointment.status === "completed") {
      throw new Error("This appointment has already been completed");
    }

    // Determine user's role
    let role: "doctor" | "patient";
    let userName: string;

    if (appointment.doctor_id === userId) {
      role = "doctor";
      const doctor = appointment.doctor_profiles;
      const title = doctor.title ? doctor.title + ". " : "";
      userName = title + doctor.first_name + " " + doctor.last_name;
    } else if (appointment.patient_id === userId) {
      role = "patient";
      userName = appointment.patient_profiles.name;
    } else {
      throw new Error("You are not authorized to join this meeting");
    }

    return {
      meetingId: appointmentId, // Use appointmentId as the meeting identifier
      role,
      name: userName,
    };
  } catch (error) {
    console.error("Meeting validation error:", error);
    throw error;
  }
}