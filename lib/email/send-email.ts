import { resend } from "@/lib/resend";
import { ReactNode } from "react";

type EmailAttachment = {
  filename: string;
  content: string; // ✅ only string
  content_type?: string; // ✅ REQUIRED
};

type SendEmailOptions = {
  to: string;
  subject: string;
  react: ReactNode;
  attachments?: EmailAttachment[];
};

export async function sendEmailWithResend({
  to,
  subject,
  react,
  attachments,
}: SendEmailOptions) {
  const { data, error } = await resend.emails.send({
    from: "Health UPI Team <contact@healthbase.app>",
    to,
    subject,
    react,
    attachments,
  });

  if (error) throw new Error(error.message || "Failed to send email");
  return data;
}
