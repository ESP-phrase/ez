import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.json(
      { error: "No session ID provided" },
      { status: 400 }
    );
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session.metadata?.userId) {
      return NextResponse.json(
        { error: "Invalid session metadata" },
        { status: 400 }
      );
    }

    // Get the subscription from the session
    if (session.subscription) {
      const subscription = await stripe.subscriptions.retrieve(
        session.subscription as string
      );

      const planLookup: Record<string, "PRO" | "ELITE"> = {};
      if (process.env.STRIPE_PRO_PRICE_ID) {
        planLookup[process.env.STRIPE_PRO_PRICE_ID] = "PRO";
      }
      if (process.env.STRIPE_ELITE_PRICE_ID) {
        planLookup[process.env.STRIPE_ELITE_PRICE_ID] = "ELITE";
      }

      const priceId = subscription.items.data[0]?.price.id || "";
      const plan = planLookup[priceId] || "PRO";

      // Update user subscription
      await db.user.update({
        where: { id: session.metadata.userId },
        data: {
          plan,
          subscriptionStatus: "ACTIVE",
          subscriptionId: subscription.id,
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        },
      });

      return NextResponse.json({
        success: true,
        plan,
        subscriptionId: subscription.id,
      });
    }

    return NextResponse.json(
      { error: "No subscription found" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Checkout success error:", error);
    return NextResponse.json(
      { error: "Failed to process checkout success" },
      { status: 500 }
    );
  }
}
