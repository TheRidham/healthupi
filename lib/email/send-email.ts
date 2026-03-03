import { resend } from "@/lib/resend";
import { ReactNode } from "react";

type SendEmailOptions = {
  to: string;
  subject: string;
  react: ReactNode;
};

export async function sendEmail({ to, subject, react }: SendEmailOptions) {
  const { data, error } = await resend.emails.send({
    from: "Health UPI Team <contact@healthbase.app>",
    to,
    subject,
    react,
  });

  if (error) throw new Error(error.message || "Failed to send email");
  return data;
}