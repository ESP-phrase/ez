"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Crown, AlertCircle } from "lucide-react";

interface SubscriptionInfo {
  plan: "FREE" | "PRO" | "ELITE";
  status: string;
  currentPeriodEnd?: string;
}

export default function SubscriptionStatus() {
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const user = localStorage.getItem("pg_user");
        if (!user) {
          setLoading(false);
          return;
        }

        const { email } = JSON.parse(user);
        const response = await fetch("/api/subscription-status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        if (response.ok) {
          const data = await response.json();
          setSubscription(data);
        }
      } catch (error) {
        console.error("Failed to fetch subscription:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, []);

  if (loading || !subscription) return null;

  if (subscription.plan === "FREE") {
    return (
      <Link
        href="/#pricing"
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 text-xs font-semibold hover:bg-blue-100 transition-all"
      >
        <Crown className="w-3.5 h-3.5" />
        Upgrade to Pro
      </Link>
    );
  }

  if (subscription.status !== "ACTIVE") {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-orange-200 bg-orange-50 text-orange-700 text-xs font-semibold">
        <AlertCircle className="w-3.5 h-3.5" />
        {subscription.status === "PAST_DUE" ? "Payment Due" : "Check subscription"}
      </div>
    );
  }

  const planColor = subscription.plan === "ELITE" ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-blue-50 text-blue-700 border-blue-200";

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${planColor} text-xs font-semibold`}>
      <Crown className="w-3.5 h-3.5" />
      {subscription.plan} Plan
    </div>
  );
}
