"use client";

import { useState } from "react";
import { X, Check, Star, Zap, ArrowRight, Shield, Lock } from "lucide-react";

const FEATURES = [
  "Unlimited AI market analysis",
  "Copy Trading — mirror top wallets",
  "BTC Edge live 5-min signals",
  "Daily winning picks from analysts",
  "Smart risk scoring per bet",
];

interface Props {
  onClose: () => void;
  userEmail: string;
  userName: string;
}

export default function UpgradeModal({ onClose, userEmail, userName }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const startTrial = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, name: userName, plan: "PRO" }),
      });
      const json = await res.json() as { url?: string; error?: string };
      if (json.url) {
        window.location.href = json.url;
      } else {
        setError(json.error ?? "Something went wrong. Try again.");
        setLoading(false);
      }
    } catch {
      setError("Could not reach server. Try again.");
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(2,8,20,0.88)", backdropFilter: "blur(10px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-md rounded-2xl border border-white/10 shadow-2xl p-6" style={{ background: "#040a14" }}>

        {/* Close */}
        <button onClick={onClose} className="absolute top-4 right-4 w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
          <X className="w-3.5 h-3.5 text-white/40" />
        </button>

        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/15 border border-blue-400/20 text-blue-400 text-[11px] font-semibold mb-3">
          <Zap className="w-3 h-3 fill-blue-400" />
          LIMITED — First month $1
        </div>

        {/* Headline */}
        <h2 className="text-xl font-extrabold text-white leading-tight mb-1 tracking-tight">
          Start winning on prediction markets
        </h2>
        <p className="text-white/35 text-xs mb-4">Join 300+ traders using AI to find edge every day.</p>

        {/* Features */}
        <div className="space-y-1.5 mb-4">
          {FEATURES.map((f) => (
            <div key={f} className="flex items-center gap-2.5">
              <div className="w-4 h-4 rounded-full bg-blue-500/15 flex items-center justify-center flex-shrink-0">
                <Check className="w-2.5 h-2.5 text-blue-400" />
              </div>
              <span className="text-sm text-white/80">{f}</span>
            </div>
          ))}
        </div>

        {/* Testimonial */}
        <div className="rounded-xl bg-white/4 border border-white/8 p-3 mb-4">
          <div className="flex gap-0.5 mb-1.5">
            {[...Array(5)].map((_, i) => <Star key={i} className="w-2.5 h-2.5 fill-blue-400 text-blue-400" />)}
          </div>
          <p className="text-xs text-white/60 leading-relaxed mb-2">&ldquo;Made back the $1 in the first 10 minutes. The AI flagged a mispriced market I&apos;d never have caught.&rdquo;</p>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-[9px] font-bold text-white">MT</div>
            <div>
              <p className="text-[10px] font-semibold text-white">Marcus T.</p>
              <p className="text-[10px] text-emerald-400">+$1,240 this month</p>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="flex items-center justify-between rounded-xl bg-blue-600/10 border border-blue-400/20 px-4 py-3 mb-3">
          <span className="text-white font-semibold text-sm">Pro Plan</span>
          <div>
            <span className="text-2xl font-extrabold text-white">$1</span>
            <span className="text-white/35 text-xs"> / first month · then $39</span>
          </div>
        </div>

        {/* Error */}
        {error && <p className="text-red-400 text-xs mb-2 text-center">{error}</p>}

        {/* CTA */}
        <button
          onClick={startTrial}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-all disabled:opacity-60 shadow-lg shadow-blue-900/40 mb-3"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            <>Start my $1 trial <ArrowRight className="w-4 h-4" /></>
          )}
        </button>

        {/* Trust */}
        <div className="flex items-center justify-center gap-4">
          <div className="flex items-center gap-1 text-white/20 text-[10px]"><Lock className="w-2.5 h-2.5" /> Secure checkout</div>
          <div className="flex items-center gap-1 text-white/20 text-[10px]"><Shield className="w-2.5 h-2.5" /> Cancel anytime</div>
        </div>
      </div>
    </div>
  );
}
