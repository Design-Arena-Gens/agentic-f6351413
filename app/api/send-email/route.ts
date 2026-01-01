import { NextResponse } from "next/server";
import { z } from "zod";
import { sendGmailMessage } from "../../../lib/gmail";

const schema = z.object({
  to: z.array(z.string().email()).min(1),
  cc: z.array(z.string().email()).optional(),
  bcc: z.array(z.string().email()).optional(),
  subject: z.string().min(1),
  body: z.string().min(1),
  replyTo: z.string().email().optional()
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const payload = schema.parse(json);

    await sendGmailMessage({
      to: payload.to,
      cc: payload.cc,
      bcc: payload.bcc,
      subject: payload.subject,
      htmlBody: payload.body,
      replyTo: payload.replyTo
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[send-email] error", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid payload", issues: error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Failed to send email" },
      { status: 500 }
    );
  }
}
