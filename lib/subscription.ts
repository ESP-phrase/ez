import { db } from "@/lib/db";
import type { SubscriptionPlan, SubscriptionStatus } from "@prisma/client";

export async function getUserSubscription(userId: string) {
  return db.user.findUnique({
    where: { id: userId },
    select: {
      plan: true,
      subscriptionStatus: true,
      currentPeriodEnd: true,
      subscriptionId: true,
    },
  });
}

export function hasFeatureAccess(
  plan: SubscriptionPlan,
  status: SubscriptionStatus,
  requiredPlan: "PRO" | "ELITE"
): boolean {
  // Check if subscription is active
  const isActive = status === "ACTIVE" || status === "TRIALING";
  if (!isActive) return false;

  // ELITE has access to all features
  if (plan === "ELITE") return true;

  // PRO has access to PRO features
  if (requiredPlan === "PRO" && plan === "PRO") return true;

  return false;
}

export function getPlanFeatures(plan: SubscriptionPlan) {
  const features: Record<SubscriptionPlan, string[]> = {
    FREE: ["Paper Trading simulator"],
    PRO: [
      "Unlimited AI Market Analysis",
      "Copy Trading — mirror top wallets",
      "Daily Winning Picks from analysts",
      "Real-Time Alerts when odds shift",
      "Smart Risk Scoring per bet",
      "AI Strategy Coach",
      "Paper Trading simulator",
      "Wallet Tracker & Leaderboard",
    ],
    ELITE: [
      "Everything in Pro",
      "Priority GPT-4o analysis model",
      "Private Discord with top traders",
      "1-on-1 monthly strategy call",
      "Custom alert thresholds & webhooks",
      "Multi-wallet copy trading (up to 10)",
      "Early access to new features",
      "Dedicated account manager",
      "Advanced backtesting suite",
    ],
  };

  return features[plan] || [];
}
