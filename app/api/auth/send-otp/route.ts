import { NextResponse } from "next/server";
import { Resend } from "resend";
import { db } from "@/lib/db";

const resend = new Resend(process.env.RESEND_API_KEY);

function generateCode(): string {
  return String(Math.floor(100_000 + Math.random() * 900_000));
}

export async function POST(req: Request) {
  try {
    const { email } = (await req.json()) as { email?: string };
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email required." }, { status: 400 });
    }

    const emailLower = email.toLowerCase().trim();
    const code = generateCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Invalidate any existing unused codes for this email
    await db.otpToken.updateMany({
      where: { email: emailLower, used: false },
      data: { used: true },
    });

    // Create new token
    await db.otpToken.create({
      data: { email: emailLower, code, expiresAt },
    });

    // Send email
    const { error } = await resend.emails.send({
      from: "PolyGoat <onboarding@resend.dev>",
      to: emailLower,
      subject: `Your PolyGoat login code: ${code}`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px; background: #040a14; color: #fff; border-radius: 16px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 32px;">
            <div style="width: 32px; height: 32px; background: rgba(59,130,246,0.15); border: 1px solid rgba(96,165,250,0.3); border-radius: 8px; display: flex; align-items: center; justify-content: center;">
              <span style="color: #60a5fa; font-size: 14px;">📈</span>
            </div>
            <span style="font-size: 16px; font-weight: 800; color: #fff;">Poly<span style="color: #60a5fa;">Goat</span></span>
          </div>
          <h1 style="font-size: 24px; font-weight: 800; margin: 0 0 8px; color: #fff;">Your login code</h1>
          <p style="color: rgba(255,255,255,0.4); margin: 0 0 32px; font-size: 14px;">Enter this code to sign in to PolyGoat. It expires in 10 minutes.</p>
          <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
            <span style="font-size: 40px; font-weight: 900; letter-spacing: 12px; color: #60a5fa;">${code}</span>
          </div>
          <p style="color: rgba(255,255,255,0.2); font-size: 12px; text-align: center; margin: 0;">If you didn't request this, you can safely ignore this email.</p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend error:", JSON.stringify(error));
      return NextResponse.json({ error: `Failed to send email: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("send-otp error:", msg);
    return NextResponse.json({ error: `Server error: ${msg}` }, { status: 500 });
  }
}
