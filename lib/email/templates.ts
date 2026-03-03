import { sendEmail } from "./send-email";
import ConsultationEmail from "./templates/ConsultationEmail";
import DoctorAppointmentEmail from "./templates/DoctorAppointmentMail";

export const emailTemplates = {
  consultation: async (payload: any) => {
    return sendEmail({
      to: payload.patientEmail,
      subject: "Your Consultation is Confirmed 🩺",
      react: ConsultationEmail(payload),
    });
  },
  doctorAppointmentMail: async (payload: any) => {
    return sendEmail({
      to: payload.doctorEmail,
      subject: "A New Appointment has been booked 🩺",
      react: DoctorAppointmentEmail(payload),
    });
  },
  // add more templates here
};