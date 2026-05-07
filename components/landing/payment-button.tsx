"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";

interface PaymentButtonProps {
  plan: "PRO" | "ELITE";
  email?: string;
  name?: string;
  children?: React.ReactNode;
  className?: string;
}

export default function PaymentButton({
  plan,
  email,
  name,
  children,
  className,
}: PaymentButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setLoading(true);
    setError(null);

    try {
      // For now, redirect to login if not authenticated
      if (!email) {
        window.location.href = "/login";
        return;
      }

      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name: name || email.split("@")[0],
          plan,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        disabled={loading}
        className={className || "group flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold text-sm hover:from-blue-500 hover:to-blue-400 transition-all shadow-lg shadow-blue-950/60 ring-1 ring-blue-400/25 disabled:opacity-50"}
      >
        {children || (
          <>
            Start winning for $1 <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </>
        )}
      </button>
      {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
    </>
  );
}
