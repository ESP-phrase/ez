"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Star, Shield, Lock, Zap } from "lucide-react";
import GoatLogo from "@/components/goat-logo";

const FEATURES = [
  "Unlimited AI market analysis",
  "Copy Trading — mirror top wallets",
  "BTC Edge live 5-min signals",
  "Daily winning picks from analysts",
  "Smart risk scoring per bet",
];

export default function StartPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) { setError("Enter a valid email."); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name: email.split("@")[0], plan: "PRO" }),
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
    <div className="min-h-screen flex" style={{ background: "#040a14" }}>

      {/* Left — value prop */}
      <div className="hidden lg:flex flex-col justify-between w-[46%] p-12 border-r border-white/5">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600/15 border border-blue-400/30 flex items-center justify-center">
            <GoatLogo size={20} />
          </div>
          <span className="text-base font-bold text-white tracking-tight">Poly<span className="text-gradient">Goat</span></span>
        </Link>

        <div>
          <p className="text-blue-400 text-xs font-semibold uppercase tracking-widest mb-4">What you get</p>
          <div className="space-y-3 mb-8">
            {FEATURES.map((f) => (
              <div key={f} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-500/15 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-blue-400" />
                </div>
                <span className="text-white/80 text-sm">{f}</span>
              </div>
            ))}
          </div>

          {/* Testimonial */}
          <div className="rounded-xl bg-white/4 border border-white/8 p-4">
            <div className="flex gap-0.5 mb-2">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-blue-400 text-blue-400" />)}
            </div>
            <p className="text-sm text-white/60 leading-relaxed mb-3">&ldquo;Made back the $1 in the first 10 minutes. The AI flagged a mispriced market I&apos;d never have caught on my own.&rdquo;</p>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white">MT</div>
              <div>
                <p className="text-xs font-semibold text-white">Marcus T.</p>
                <p className="text-[10px] text-emerald-400">+$1,240 this month</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[{ value: "300+", label: "Traders" }, { value: "73%", label: "Win Rate" }, { value: "$4.2M+", label: "Profits" }].map((s) => (
            <div key={s.label} className="surface-card rounded-xl p-3 text-center">
              <p className="text-base font-extrabold text-gradient">{s.value}</p>
              <p className="text-[10px] text-white/30">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <Link href="/" className="flex items-center gap-2.5 mb-10 lg:hidden">
          <div className="w-7 h-7 rounded-lg bg-blue-600/15 border border-blue-400/30 flex items-center justify-center">
            <GoatLogo size={18} />
          </div>
          <span className="text-base font-bold text-white tracking-tight">Poly<span className="text-gradient">Goat</span></span>
        </Link>

        <div className="w-full max-w-sm">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/15 border border-blue-400/20 text-blue-400 text-[11px] font-semibold mb-5">
            <Zap className="w-3 h-3 fill-blue-400" />
            First month $1 — then $39/mo
          </div>

          <h1 className="text-2xl font-extrabold text-white mb-1 tracking-tight">Start your $1 trial</h1>
          <p className="text-white/35 text-sm mb-7">Enter your email to go straight to checkout. Cancel anytime.</p>

          <form onSubmit={handleStart} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-white/40 mb-1.5">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoFocus
                className="w-full px-4 py-2.5 rounded-xl surface-card text-white placeholder-white/15 text-sm focus:outline-none focus:border-blue-400/40 transition-colors"
              />
            </div>

            {error && <p className="text-red-400 text-xs px-1">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-all disabled:opacity-60 shadow-lg shadow-blue-900/40"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>Start for $1 <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          {/* Trust */}
          <div className="flex items-center justify-center gap-4 mt-5">
            <div className="flex items-center gap-1 text-white/20 text-[10px]"><Lock className="w-2.5 h-2.5" /> Secure checkout</div>
            <div className="flex items-center gap-1 text-white/20 text-[10px]"><Shield className="w-2.5 h-2.5" /> Cancel anytime</div>
          </div>

          <p className="text-center text-[10px] text-white/15 mt-4">
            Already have an account?{" "}
            <Link href="/login" className="underline hover:text-white/30">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
