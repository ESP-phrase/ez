import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email, code } = (await req.json()) as { email?: string; code?: string };

    if (!email || !code) {
      return NextResponse.json({ error: "Email and code required." }, { status: 400 });
    }

    const emailLower = email.toLowerCase().trim();
    const trimmedCode = code.trim();

    // Find the most recent unused, unexpired token for this email
    const token = await db.otpToken.findFirst({
      where: {
        email: emailLower,
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!token) {
      return NextResponse.json({ error: "Code expired or not found. Request a new one." }, { status: 401 });
    }

    if (token.code !== trimmedCode) {
      return NextResponse.json({ error: "Incorrect code." }, { status: 401 });
    }

    // Mark token as used
    await db.otpToken.update({ where: { id: token.id }, data: { used: true } });

    // Find or create user
    let user = await db.user.findUnique({ where: { email: emailLower } });
    const isNew = !user;
    if (!user) {
      const name = emailLower.split("@")[0];
      user = await db.user.create({ data: { email: emailLower, name } });

      // Send welcome email (fire and forget — don't block auth)
      const siteUrl = process.env.NEXT_PUBLIC_URL || "https://polygoat.io";
      resend.emails.send({
        from: "PolyGoat <onboarding@resend.dev>",
        to: emailLower,
        subject: "Welcome to PolyGoat 🐐",
        html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="background:#040a14;color:#fff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;margin:0;padding:0;">
  <div style="max-width:520px;margin:40px auto;padding:40px 32px;background:#080f1e;border-radius:16px;border:1px solid rgba(255,255,255,0.08);">
    <div style="margin-bottom:28px;">
      <span style="font-size:22px;font-weight:800;letter-spacing:-0.5px;color:#fff;">Poly<span style="color:#3b82f6;">Goat</span> 🐐</span>
    </div>
    <h1 style="font-size:22px;font-weight:700;color:#fff;margin:0 0 10px;">Welcome aboard, ${name}!</h1>
    <p style="color:rgba(255,255,255,0.55);font-size:15px;line-height:1.6;margin:0 0 24px;">
      You&apos;ve joined 300+ traders using AI to find edge on Polymarket and Kalshi. Here&apos;s what&apos;s waiting for you inside:
    </p>
    <div style="background:rgba(59,130,246,0.08);border:1px solid rgba(59,130,246,0.2);border-radius:12px;padding:20px;margin-bottom:24px;">
      <p style="margin:0 0 10px;color:rgba(255,255,255,0.8);font-size:14px;">✅ <strong>AI Analyzer</strong> — Upload any market screenshot for instant analysis</p>
      <p style="margin:0 0 10px;color:rgba(255,255,255,0.8);font-size:14px;">✅ <strong>BTC Edge</strong> — Real-time 5-min BTC prediction market signals</p>
      <p style="margin:0 0 10px;color:rgba(255,255,255,0.8);font-size:14px;">✅ <strong>Copy Trading</strong> — Mirror top wallets with configurable risk</p>
      <p style="margin:0;color:rgba(255,255,255,0.8);font-size:14px;">✅ <strong>Paper Trading</strong> — Practice on live markets risk-free</p>
    </div>
    <a href="${siteUrl}/dashboard" style="display:inline-block;background:#2563eb;color:#fff;font-weight:700;font-size:15px;padding:14px 32px;border-radius:10px;text-decoration:none;margin-bottom:24px;">
      Go to my dashboard →
    </a>
    <p style="color:rgba(255,255,255,0.3);font-size:12px;margin:0;">
      Want the full edge? <a href="${siteUrl}/start" style="color:#3b82f6;text-decoration:none;">Start your $1 trial</a> and unlock everything.<br/><br/>
      — The PolyGoat team<br/>
      <a href="${siteUrl}/unsubscribe" style="color:rgba(255,255,255,0.2);text-decoration:none;">Unsubscribe</a>
    </p>
  </div>
</body>
</html>`,
      }).catch((err: unknown) => console.error("Welcome email error:", err));
    }

    return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name }, isNew });
  } catch (err) {
    console.error("verify-otp error:", err);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
