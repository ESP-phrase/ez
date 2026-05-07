import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const baseUrl = process.env.NEXT_PUBLIC_URL ?? "http://localhost:3000";

  if (!code) {
    return NextResponse.redirect(`${baseUrl}/login?error=no_code`);
  }

  try {
    const clientId = process.env.GOOGLE_CLIENT_ID!;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
    const redirectUri = `${baseUrl}/api/auth/google/callback`;

    // Exchange code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokens = await tokenRes.json() as { access_token?: string; error?: string };
    if (!tokenRes.ok || !tokens.access_token) {
      return NextResponse.redirect(`${baseUrl}/login?error=token_failed`);
    }

    // Get user info
    const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const googleUser = await userRes.json() as { email?: string; name?: string; picture?: string };

    if (!googleUser.email) {
      return NextResponse.redirect(`${baseUrl}/login?error=no_email`);
    }

    const emailLower = googleUser.email.toLowerCase();

    // Find or create user
    let user = await db.user.findUnique({ where: { email: emailLower } });
    if (!user) {
      user = await db.user.create({
        data: {
          email: emailLower,
          name: googleUser.name ?? emailLower.split("@")[0],
        },
      });
    }

    // Redirect to dashboard with user info encoded in URL (client picks it up)
    const userData = encodeURIComponent(JSON.stringify({ id: user.id, email: user.email, name: user.name }));
    return NextResponse.redirect(`${baseUrl}/auth/callback?user=${userData}`);
  } catch (err) {
    console.error("Google OAuth error:", err);
    return NextResponse.redirect(`${baseUrl}/login?error=server_error`);
  }
}
