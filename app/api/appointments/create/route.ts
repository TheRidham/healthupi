import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const supabaseAdmin = getSupabaseAdmin();

    const body = await req.json();

    const {
      doctorId,
      patientData,
      slot,
      services,
      razorpayOrderId,
    } = body;

    // 1. Get current user
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

    const patientId = user.id;

    // 2. Upsert patient profile
    const { error: profileError } = await supabaseAdmin
      .from("patient_profiles")
      .upsert(
        {
          user_id: patientId,
          name: patientData.fullName,
          gender: patientData.gender,
          phone: patientData.mobileNumber,
          email: patientData.email,
          address: patientData.address,
          // Calculate date_of_birth from age (approximate)
          date_of_birth: patientData.age
            ? new Date(new Date().getFullYear() - patientData.age, 0, 1)
                .toISOString()
                .split("T")[0]
            : null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

    if (profileError) {
      console.error("Error upserting patient profile:", profileError);
      return NextResponse.json(
        { success: false, error: "Failed to save patient profile" },
        { status: 500 }
      );
    }

    // 3. Create appointment
    const appointmentDate = slot.date; // YYYY-MM-DD
    const [year, month, day] = appointmentDate.split("-").map(Number);
    const fullDate = new Date(year, month - 1, day);

    const { data: appointment, error: appointmentError } = await supabaseAdmin
      .from("appointments")
      .insert({
        doctor_id: doctorId,
        patient_id: patientId,
        service_id: services[0]?.id || "consultation",
        appointment_date: appointmentDate,
        start_time: slot.startTime,
        end_time: slot.endTime,
        status: "confirmed",
        payment_status: "paid",
        notes: patientData.issueDescription,
        razorpay_order_id: razorpayOrderId,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (appointmentError) {
      console.error("Error creating appointment:", appointmentError);
      return NextResponse.json(
        { success: false, error: "Failed to create appointment" },
        { status: 500 }
      );
    }

    // 4. Generate confirmation number
    const confirmationNumber = `HU${new Date().getFullYear()}${(appointment.id).substring(0, 8).toUpperCase()}`;

    // 5. TODO: Send email notifications

    return NextResponse.json({
      success: true,
      data: {
        appointmentId: appointment.id,
        confirmationNumber,
        appointmentDate,
        appointmentTime: slot.startTime,
        duration: slot.duration,
      },
    });
  } catch (error) {
    console.error("Error in appointments/create:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
