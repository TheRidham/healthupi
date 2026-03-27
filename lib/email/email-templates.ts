import { sendEmailWithResend } from "./send-email";
import { generateAppointmentIcs } from "./generate-ics";
import AppointmentDoctorEmail from "./templates/AppointmentDoctorEmail";
import AppointmentPatientEmail from "./templates/AppointmentPatientEmail";

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
  sendPatientConsultationEmail: async (payload: any) => {
    const attachments = getIcsAttachment(payload);
    
    return sendEmailWithResend({
      to: payload.patientEmail,
      subject: "Your Appointment is Confirmed 🩺",
      react: AppointmentPatientEmail(payload),
      attachments,
    });
  },
  sendDoctorAppointmentEmail: async (payload: any) => {
    const attachments = getIcsAttachment(payload);

    return sendEmailWithResend({
      to: payload.doctorEmail,
      subject: "A New Appointment has been booked 🩺",
      react: AppointmentDoctorEmail(payload),
      attachments,
    });
  },
  // add more templates here
};
