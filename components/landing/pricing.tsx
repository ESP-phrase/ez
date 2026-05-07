"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, ArrowRight, Zap, Crown, Shield, TrendingUp, Users } from "lucide-react";
import PaymentButton from "./payment-button";

const proFeatures = [
  "Unlimited AI Market Analysis",
  "Copy Trading — mirror top wallets",
  "Daily Winning Picks from analysts",
  "Real-Time Alerts when odds shift",
  "Smart Risk Scoring per bet",
  "AI Strategy Coach",
  "Paper Trading simulator",
  "Wallet Tracker & Leaderboard",
  "Cancel anytime",
];

const eliteFeatures = [
  "Everything in Pro",
  "Priority GPT-4o analysis model",
  "Private Discord with top traders",
  "1-on-1 monthly strategy call",
  "Custom alert thresholds & webhooks",
  "Multi-wallet copy trading (up to 10)",
  "Early access to new features",
  "Dedicated account manager",
  "Advanced backtesting suite",
];

const trustPoints = [
  { icon: Shield, label: "We never touch your funds", sub: "Read-only API access only" },
  { icon: TrendingUp, label: "73% average win rate", sub: "Verified across all picks" },
  { icon: Users, label: "300+ active traders", sub: "Growing community" },
];

function useCountdown() {
  const [time, setTime] = useState({ h: 23, m: 59, s: 59 });
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const end = new Date();
      end.setHours(23, 59, 59, 0);
      if (end <= now) end.setDate(end.getDate() + 1);
      const diff = Math.max(0, Math.floor((end.getTime() - now.getTime()) / 1000));
      setTime({ h: Math.floor(diff / 3600), m: Math.floor((diff % 3600) / 60), s: diff % 60 });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

export default function Pricing() {
  const { h, m, s } = useCountdown();
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <section id="pricing" className="py-28 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-xs text-blue-400 font-semibold tracking-widest uppercase mb-3">Pricing</p>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 tracking-tight">
            One plan.{" "}
            <span className="text-gradient">Everything included.</span>
          </h2>
          <p className="text-white/45 max-w-md mx-auto text-sm">
            No tiers of features — pick the support level that fits you. First month just $1.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">

          {/* Trust column */}
          <div className="space-y-3">
            {trustPoints.map((tp) => (
              <div key={tp.label} className="flex items-start gap-3 surface-card rounded-xl p-4">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-400/20 flex items-center justify-center flex-shrink-0">
                  <tp.icon className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{tp.label}</p>
                  <p className="text-xs text-white/35 mt-0.5">{tp.sub}</p>
                </div>
              </div>
            ))}
            <div className="surface-card rounded-xl p-5">
              <div className="flex gap-0.5 mb-3">{[...Array(5)].map((_, i) => <span key={i} className="text-amber-400 text-xs">★</span>)}</div>
              <p className="text-white/55 text-sm leading-relaxed italic">&ldquo;Made back my subscription in the first day. The AI flagged a mispriced market I&apos;d never have caught.&rdquo;</p>
              <p className="text-xs text-white/30 mt-3">— Marcus T., @sharpblocks</p>
            </div>
          </div>

          {/* Pro Plan */}
          <div className="relative rounded-2xl border border-blue-400/25 overflow-hidden" style={{ background: "linear-gradient(145deg, #0e1f3d 0%, #060e1c 60%, #04080f 100%)" }}>
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent" />
            <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-24 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />

            <div className="relative p-7">
              <div className="flex items-center justify-between mb-5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-bold">
                  <Zap className="w-3 h-3" /> Most Popular
                </span>
                <span className="text-[10px] text-white/30 font-semibold">97% OFF TODAY</span>
              </div>

              <div className="mb-1 flex items-end gap-2">
                <span className="text-5xl font-black text-white leading-none">$1</span>
                <div className="pb-1">
                  <span className="text-white/25 text-base line-through">$39</span>
                  <p className="text-white/40 text-xs">first month</p>
                </div>
              </div>
              <p className="text-white/30 text-xs mb-4">Then $39/month. Cancel anytime.</p>

              {/* Countdown */}
              <div className="flex items-center gap-1.5 mb-5 p-2.5 rounded-xl bg-white/3 border border-white/8 text-xs">
                <span className="text-white/30 mr-0.5">Ends in</span>
                {[{ val: pad(h), label: "hr" }, { val: pad(m), label: "min" }, { val: pad(s), label: "sec" }].map((item, i) => (
                  <div key={i} className="flex items-baseline gap-0.5">
                    {i > 0 && <span className="text-white/20 mr-0.5">:</span>}
                    <span className="font-mono font-bold text-white">{item.val}</span>
                    <span className="text-white/25 text-[10px]">{item.label}</span>
                  </div>
                ))}
              </div>

              <ul className="space-y-2 mb-6">
                {proFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs text-white/60">
                    <span className="w-4 h-4 rounded-full bg-blue-500/15 border border-blue-400/25 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-2.5 h-2.5 text-blue-400" />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>

              <PaymentButton
                plan="PRO"
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold text-sm hover:from-blue-500 hover:to-blue-400 transition-all shadow-lg shadow-blue-900/40 ring-1 ring-blue-400/30"
              >
                Get Pro for $1 <ArrowRight className="w-4 h-4" />
              </PaymentButton>
              <p className="text-center text-[10px] text-white/20 mt-2.5">✓ Instant access &nbsp;·&nbsp; ✓ Cancel anytime</p>
            </div>
          </div>

          {/* Elite Plan */}
          <div className="relative rounded-2xl border border-amber-400/20 overflow-hidden" style={{ background: "linear-gradient(145deg, #1a1200 0%, #0d0900 60%, #080600 100%)" }}>
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />
            <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-24 rounded-full bg-amber-600/8 blur-3xl pointer-events-none" />

            <div className="relative p-7">
              <div className="flex items-center justify-between mb-5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-black text-xs font-bold shadow-sm">
                  <Crown className="w-3 h-3" /> Elite
                </span>
                <span className="text-[10px] text-amber-400/60 font-semibold">BEST RESULTS</span>
              </div>

              <div className="mb-1 flex items-end gap-2">
                <span className="text-5xl font-black text-white leading-none">$99</span>
                <div className="pb-1">
                  <span className="text-white/25 text-base line-through">$299</span>
                  <p className="text-white/40 text-xs">per month</p>
                </div>
              </div>
              <p className="text-white/30 text-xs mb-4">Billed monthly. Cancel anytime.</p>

              {/* Value prop */}
              <div className="mb-5 p-2.5 rounded-xl bg-amber-500/8 border border-amber-400/15 text-xs text-amber-300/70">
                🏆 Average Elite member earns <span className="font-bold text-amber-300">+$3,200/mo</span> — 32× the subscription cost
              </div>

              <ul className="space-y-2 mb-6">
                {eliteFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs text-white/60">
                    <span className="w-4 h-4 rounded-full bg-amber-500/15 border border-amber-400/25 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-2.5 h-2.5 text-amber-400" />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>

              <PaymentButton
                plan="ELITE"
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold text-sm hover:from-amber-400 hover:to-yellow-400 transition-all shadow-lg shadow-amber-900/30"
              >
                Unlock Elite Access <ArrowRight className="w-4 h-4" />
              </PaymentButton>
              <p className="text-center text-[10px] text-white/20 mt-2.5">✓ Cancel anytime &nbsp;·&nbsp; ✓ Seats limited</p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
