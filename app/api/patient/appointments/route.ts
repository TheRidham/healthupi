import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Fetch all appointments for this patient using user_id as patient_id
    const { data: appointments, error: appointmentsError } = await supabase
      .from("appointments")
      .select(
        `
          id,
          doctor_id,
          appointment_date,
          start_time,
          end_time,
          status,
          services (
            name
          ),
          doctor_profiles (
            first_name,
            last_name,
            clinic_name,
            phone
          )
        `
      )
      .eq("patient_id", user.id)
      .order("appointment_date", { ascending: false });

    if (appointmentsError) {
      console.error("Error fetching appointments:", appointmentsError);
      return NextResponse.json(
        { success: false, error: "Failed to fetch appointments" },
        { status: 500 }
      );
    }

    // Transform appointments to match expected format
    const transformedAppointments = (appointments || []).map((apt) => {
      const doctorProfile = Array.isArray(apt.doctor_profiles) 
        ? apt.doctor_profiles[0] 
        : apt.doctor_profiles;
      
      const serviceData = Array.isArray(apt.services) 
        ? apt.services[0] 
        : apt.services;
      
      const serviceName = serviceData?.name || "";
      const isChatService = serviceName.toLowerCase().includes('chat');
      
      return {
        id: apt.id,
        doctor_id: apt.doctor_id,
        patient_id: user.id,
        appointment_date: apt.appointment_date,
        appointment_time: apt.start_time,
        duration: null,
        service_name: serviceName,
        status: apt.status,
        consultation_type: isChatService ? "chat" : "offline",
        doctor: {
          first_name: doctorProfile?.first_name || "Dr.",
          last_name: doctorProfile?.last_name || "Unknown",
          clinic_name: doctorProfile?.clinic_name || "Unknown Clinic",
          phone: doctorProfile?.phone || "",
        },
      };
    });

    return NextResponse.json({
      success: true,
      data: transformedAppointments,
    });
  } catch (error) {
    console.error("Error in patient appointments:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
