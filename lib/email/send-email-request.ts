type SendEmailType = "sendPatientConsultationEmail" | "sendDoctorAppointmentEmail";

type SendEmailPayload = Record<string, any>;

export async function sendEmailRequest(
  type: SendEmailType,
  payload: SendEmailPayload
) {
  const response = await fetch("/api/send-email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ type, payload }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to send email");
  }

  return response.json();
}