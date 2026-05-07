import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { userId?: string; email?: string };
    const { userId, email } = body;

    if (!userId && !email) {
      return NextResponse.json(
        { error: "User ID or email required" },
        { status: 400 }
      );
    }

    const user = await db.user.findFirst({
      where: userId ? { id: userId } : { email: email!.toLowerCase().trim() },
      select: { stripeCustomerId: true },
    });

    if (!user?.stripeCustomerId) {
      return NextResponse.json(
        { error: "No active subscription found. Please subscribe first." },
        { status: 404 }
      );
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}/dashboard/settings`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Customer portal error:", error);
    return NextResponse.json(
      { error: "Failed to create customer portal session" },
      { status: 500 }
    );
  }
}
