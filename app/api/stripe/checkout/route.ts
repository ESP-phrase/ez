import { NextResponse } from "next/server";
import { stripe, STRIPE_PLANS } from "@/lib/stripe";
import { db } from "@/lib/db";
import { ensureUser } from "@/lib/users";

export async function POST(request: Request) {
  try {
    const { email, name, plan } = await request.json();

    if (!email || !plan || !["PRO", "ELITE"].includes(plan)) {
      return NextResponse.json(
        { error: "email and valid plan are required" },
        { status: 400 }
      );
    }

    const planConfig = STRIPE_PLANS[plan as keyof typeof STRIPE_PLANS];
    if (!planConfig.priceId) {
      return NextResponse.json(
        { error: `Stripe price ID not configured for ${plan}` },
        { status: 500 }
      );
    }

    const user = await ensureUser(email, name);

    let customerId = user.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email,
        metadata: { userId: user.id },
      });
      customerId = customer.id;
      await db.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId },
      });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: planConfig.priceId,
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_settings: {
          end_behavior: { missing_payment_method: "cancel" },
        },
        trial_period_days: 30,
      },
      payment_method_collection: "always",
      success_url: `${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}/#pricing`,
      metadata: { userId: user.id, plan },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
