import { NextResponse } from "next/server";
import { emailTemplates } from "@/lib/email/email-templates";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, payload } = body;

    if (!type || !payload) {
      return NextResponse.json({ error: "Missing type or payload" }, { status: 400 });
    }

    const templateFunc = emailTemplates[type as keyof typeof emailTemplates];

    if (!templateFunc) {
      return NextResponse.json({ error: "Invalid email type" }, { status: 400 });
    }

    const data = await templateFunc(payload);

    return NextResponse.json({ success: true, messageId: data?.id });
  } catch (err) {
    console.error("Email Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}