import { NextResponse } from "next/server";
import { resend } from "@/lib/resend";
import ConsultationEmail from "@/emails/ConsultationEmail";

export const runtime = "nodejs"; // Required for Resend

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      patientEmail,
      patientName,
      doctorName,
      specialization,
      date,
      time,
      mode,
      meetingLink,
      appointmentId,
    } = body;

    // Basic validation
    if (
      !patientEmail ||
      !patientName ||
      !doctorName ||
      !date ||
      !time ||
      !mode ||
      !meetingLink ||
      !appointmentId
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const { data, error } = await resend.emails.send({
      from: "Health Upi Team <consult@yourdomain.com>", // Must be verified domain
      to: patientEmail,
      subject: "Your Consultation is Confirmed 🩺",
      react: ConsultationEmail({
        patientName,
        doctorName,
        specialization,
        date,
        time,
        mode,
        meetingLink,
        appointmentId,
      }),
    });

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      messageId: data?.id,
    });
  } catch (error) {
    console.error("Email Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}


//------------frontend call example----------------
/*
await fetch("/api/send-consultation-email", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    patientEmail: "patient@gmail.com",
    patientName: "Vinit",
    doctorName: "Sharma",
    specialization: "Cardiologist",
    date: "10 March 2026",
    time: "5:00 PM IST",
    mode: "video",
    meetingLink: "https://yourapp.com/meeting/123",
    appointmentId: "APT-12345",
  }),
});
*/