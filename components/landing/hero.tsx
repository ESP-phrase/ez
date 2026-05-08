"use client";

import Link from "next/link";
import { ArrowRight, Star, Shield, Users, TrendingUp, Zap, Copy, CheckCircle2, AlertCircle } from "lucide-react";

export default function Hero() {
  const sparkles = [
    { top: "8%",  left: "10%", size: "text-sm",   delay: "0s" },
    { top: "15%", left: "78%", size: "text-base",  delay: "0.8s" },
    { top: "28%", left: "6%",  size: "text-xs",    delay: "1.7s" },
    { top: "40%", left: "89%", size: "text-sm",    delay: "0.4s" },
    { top: "60%", left: "14%", size: "text-xs",    delay: "1.1s" },
    { top: "70%", left: "83%", size: "text-base",  delay: "2.1s" },
  ];

  return (
    <section className="hero-bg relative overflow-hidden flex flex-col items-center justify-start text-center px-4 pt-20 pb-16">
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0 animate-hero-grid opacity-20 [background-image:linear-gradient(to_right,rgba(148,163,184,0.18)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.18)_1px,transparent_1px)] [background-size:48px_48px]" />
      <div className="pointer-events-none absolute -top-20 -left-16 h-72 w-72 rounded-full bg-blue-500/25 blur-3xl animate-hero-orb" />
      <div className="pointer-events-none absolute top-24 -right-10 h-80 w-80 rounded-full bg-violet-400/15 blur-3xl animate-hero-orb [animation-delay:2s]" />
      <div className="pointer-events-none absolute bottom-0 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-cyan-400/10 blur-3xl animate-hero-orb [animation-delay:4s]" />
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {sparkles.map((s) => (
          <span key={`${s.top}-${s.left}`} className={`absolute ${s.size} text-blue-200/80 animate-hero-twinkle select-none`} style={{ top: s.top, left: s.left, animationDelay: s.delay }}>✦</span>
        ))}
      </div>

      <h1 className="relative z-10 max-w-3xl text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-[1.08] tracking-tight mb-7">
        Be the <span className="text-gradient">goat</span><br className="hidden sm:block" /> on prediction markets
      </h1>

      <p className="relative z-10 max-w-lg text-lg text-white/55 mb-10 leading-relaxed">
        AI analysis, expert picks, copy trading, and live BTC signals — everything you need to win on Polymarket and Kalshi.
      </p>

      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
        <Link href="/start" className="group flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold text-sm hover:from-blue-500 hover:to-blue-400 transition-all shadow-lg shadow-blue-950/60 ring-1 ring-blue-400/25">
          Get started for $1 <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>
        <Link href="#features" className="px-8 py-3.5 rounded-xl border border-white/15 bg-white/5 text-white/80 font-medium text-sm hover:bg-white/10 hover:border-white/25 transition-all">
          See how it works
        </Link>
      </div>

      <div className="relative z-10 flex flex-wrap justify-center items-center gap-x-6 gap-y-2 text-xs mb-16">
        <div className="flex items-center gap-1.5">
          <div className="flex">{[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />)}</div>
          <span className="text-white/60">4.9 / 5 rating</span>
        </div>
        <span className="text-white/15 hidden sm:block">|</span>
        <div className="flex items-center gap-1.5"><Shield className="w-3 h-3 text-blue-400" /><span className="text-white/60">We never touch your funds</span></div>
        <span className="text-white/15 hidden sm:block">|</span>
        <div className="flex items-center gap-1.5"><Users className="w-3 h-3 text-blue-400" /><span className="text-white/60">Polymarket, Kalshi & more</span></div>
      </div>

      {/* ── Floating Product Cards ── */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

          {/* Card 1 — AI Analysis */}
          <div className="animate-float rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-950/80 to-[#060c18] p-5 text-left shadow-2xl shadow-blue-950/50 ring-1 ring-white/5 backdrop-blur-sm" style={{ animationDelay: "0s" }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
                  <TrendingUp className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">AI Analyzer</span>
              </div>
              <span className="text-[10px] text-white/30">just now</span>
            </div>
            <p className="text-xs text-white/50 mb-2 leading-relaxed">Will the Fed cut rates in June 2026?</p>
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl font-extrabold text-white">YES</span>
              <div className="text-right">
                <div className="text-emerald-400 text-sm font-bold">82% confidence</div>
                <div className="text-white/30 text-[10px]">Edge: +14%</div>
              </div>
            </div>
            <div className="w-full bg-white/5 rounded-full h-1.5">
              <div className="bg-gradient-to-r from-blue-500 to-emerald-400 h-1.5 rounded-full" style={{ width: "82%" }} />
            </div>
            <div className="mt-3 flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0" />
              <span className="text-[10px] text-white/40">Mispriced — market at 68%, fair value 82%</span>
            </div>
          </div>

          {/* Card 2 — BTC Edge */}
          <div className="animate-float rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-950/80 to-[#060c18] p-5 text-left shadow-2xl shadow-violet-950/50 ring-1 ring-white/5 backdrop-blur-sm sm:translate-y-4" style={{ animationDelay: "0.6s" }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center">
                  <Zap className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-[11px] font-bold text-violet-400 uppercase tracking-wider">BTC Edge</span>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />LIVE
              </span>
            </div>
            <div className="mb-3">
              <div className="text-[10px] text-white/30 mb-1">5-MIN SIGNAL</div>
              <div className="text-3xl font-extrabold text-white mb-0.5">$94,820</div>
              <div className="text-emerald-400 text-xs font-semibold">↑ +$340 from open</div>
            </div>
            <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-3 py-2.5">
              <div className="text-emerald-400 text-xs font-bold mb-0.5">BUY signal active</div>
              <div className="text-white/40 text-[10px]">Price will end ABOVE $94,500 · 73% prob</div>
            </div>
          </div>

          {/* Card 3 — Copy Trade */}
          <div className="animate-float rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-950/80 to-[#060c18] p-5 text-left shadow-2xl shadow-cyan-950/50 ring-1 ring-white/5 backdrop-blur-sm" style={{ animationDelay: "1.2s" }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-cyan-600 flex items-center justify-center">
                  <Copy className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">Copy Trade</span>
              </div>
              <span className="text-[10px] text-white/30">2m ago</span>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-xs font-extrabold text-white flex-shrink-0">SB</div>
              <div>
                <div className="text-sm font-bold text-white">@sharpblocks</div>
                <div className="text-emerald-400 text-[11px] font-semibold">+$1,240 this month</div>
              </div>
            </div>
            <div className="space-y-2">
              {[
                { market: "Fed rate cut June", verdict: "YES", stake: "$25", pnl: "+$18.40" },
                { market: "BTC above $100k", verdict: "NO", stake: "$15", pnl: "+$9.10" },
              ].map((t) => (
                <div key={t.market} className="flex items-center justify-between rounded-lg bg-white/4 px-3 py-2">
                  <div>
                    <div className="text-[10px] text-white/50 truncate max-w-[110px]">{t.market}</div>
                    <div className="text-xs font-bold text-white">{t.verdict} · {t.stake}</div>
                  </div>
                  <div className="text-emerald-400 text-xs font-bold">{t.pnl}</div>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-1.5">
              <AlertCircle className="w-3 h-3 text-cyan-400 flex-shrink-0" />
              <span className="text-[10px] text-white/40">Mirrored automatically · read-only keys</span>
            </div>
          </div>

        </div>

        {/* Bottom stats bar */}
        <div className="mt-8 flex flex-wrap justify-center gap-6 sm:gap-12">
          {[
            { value: "300+", label: "Active traders" },
            { value: "4.9★",  label: "User rating" },
            { value: "$4.2M+", label: "Tracked volume" },
            { value: "<10s", label: "AI analysis time" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-xl sm:text-2xl font-extrabold text-gradient">{s.value}</div>
              <div className="text-[11px] text-white/30 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
