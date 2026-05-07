import Stripe from "stripe";

// Lazy singleton — only throws at runtime when actually used, not at build time
let _stripe: Stripe | null = null;
export function getStripe(): Stripe {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  _stripe = new Stripe(key, { apiVersion: "2024-06-20" });
  return _stripe;
}

/** @deprecated use getStripe() */
export const stripe: Stripe = new Proxy({} as Stripe, {
  get(_t, prop) {
    return (getStripe() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export const STRIPE_PLANS = {
  PRO: {
    name: "Pro",
    price: 1, // $1 first month
    regularPrice: 3900, // $39/month in cents
    interval: "month",
    priceId: process.env.STRIPE_PRO_PRICE_ID || "",
    features: [
      "Unlimited AI Analysis on any market",
      "Copy Trading — mirror winning traders",
      "Daily Winning Picks from analysts",
      "Real-Time Alerts when odds shift",
      "Smart Risk Scoring per bet",
      "AI Strategy Coach",
      "Paper Trading simulator",
      "Wallet Tracker & Leaderboard",
    ],
  },
  ELITE: {
    name: "Elite",
    price: 9900, // $99/month in cents
    interval: "month",
    priceId: process.env.STRIPE_ELITE_PRICE_ID || "",
    features: [
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
  },
};
