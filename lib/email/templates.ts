import { sendEmail } from "./send-email";
import ConsultationEmail from "./templates/ConsultationEmail";
import DoctorAppointmentEmail from "./templates/DoctorAppointmentMail";
import { generateAppointmentIcs } from "./generate-ics";

function getIcsAttachment(payload: any) {
  try {
    const icsContent = generateAppointmentIcs({
      appointmentId: payload.appointmentId,
      appointmentDate: payload.appointmentDate,
      time: payload.time,
      endTime: payload.endTime,
      durationMinutes: payload.durationMinutes,
      doctorName: payload.doctorName,
      patientName: payload.patientName,
      doctorEmail: payload.doctorEmail,
      patientEmail: payload.patientEmail,
      meetingLink: payload.meetingLink,
      mode: payload.mode,
      location: payload.location,
    });

    return [
      {
        filename: `appointment-${payload.appointmentId}.ics`,
        content: icsContent, // ✅ no need Buffer
        content_type: "text/calendar; charset=utf-8; method=REQUEST",
      },
    ];
  } catch (error) {
    console.error("[emailTemplates] Failed to generate ICS attachment:", error);
    return undefined;
  }
}

export const emailTemplates = {
  consultation: async (payload: any) => {
    const attachments = getIcsAttachment(payload);
    console.log("attachments: ", attachments);
    return sendEmail({
      to: payload.patientEmail,
      subject: "Your Consultation is Confirmed 🩺",
      react: ConsultationEmail(payload),
      attachments,
    });
  },
  doctorAppointmentMail: async (payload: any) => {
    const attachments = getIcsAttachment(payload);

    return sendEmail({
      to: payload.doctorEmail,
      subject: "A New Appointment has been booked 🩺",
      react: DoctorAppointmentEmail(payload),
      attachments,
    });
  },
  // add more templates here
};