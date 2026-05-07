import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import Stripe from "stripe";

const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "";

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature") || "";

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "customer.subscription.created": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const user = await db.user.findFirst({
          where: { stripeCustomerId: customerId },
        });

        if (user) {
          const planLookup: Record<string, "PRO" | "ELITE"> = {};
          // Map Stripe price IDs to plan names from env
          if (process.env.STRIPE_PRO_PRICE_ID) {
            planLookup[process.env.STRIPE_PRO_PRICE_ID] = "PRO";
          }
          if (process.env.STRIPE_ELITE_PRICE_ID) {
            planLookup[process.env.STRIPE_ELITE_PRICE_ID] = "ELITE";
          }

          const priceId = (subscription.items.data[0]?.price.id || "") as string;
          const plan = planLookup[priceId] || "PRO";

          await db.user.update({
            where: { id: user.id },
            data: {
              plan,
              subscriptionStatus: "ACTIVE",
              subscriptionId: subscription.id,
              currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            },
          });
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const user = await db.user.findFirst({
          where: { stripeCustomerId: customerId },
        });

        if (user) {
          const status = subscription.status;
          const statusMap: Record<string, typeof user.subscriptionStatus> = {
            trialing: "TRIALING",
            active: "ACTIVE",
            past_due: "PAST_DUE",
            canceled: "CANCELED",
            unpaid: "UNPAID",
          };

          await db.user.update({
            where: { id: user.id },
            data: {
              subscriptionStatus: statusMap[status] || "INACTIVE",
              currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            },
          });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const user = await db.user.findFirst({
          where: { stripeCustomerId: customerId },
        });

        if (user) {
          await db.user.update({
            where: { id: user.id },
            data: {
              plan: "FREE",
              subscriptionStatus: "INACTIVE",
              subscriptionId: null,
            },
          });
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        const user = await db.user.findFirst({
          where: { stripeCustomerId: customerId },
        });

        if (user && invoice.subscription) {
          await db.user.update({
            where: { id: user.id },
            data: {
              subscriptionStatus: "ACTIVE",
            },
          });
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        const user = await db.user.findFirst({
          where: { stripeCustomerId: customerId },
        });

        if (user) {
          await db.user.update({
            where: { id: user.id },
            data: {
              subscriptionStatus: "PAST_DUE",
            },
          });
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
