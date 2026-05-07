"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Star, Shield, Users } from "lucide-react";

export default function Hero() {
  const sparkles = [
    { top: "10%", left: "11%", size: "text-sm", delay: "0s" },
    { top: "18%", left: "77%", size: "text-base", delay: "0.8s" },
    { top: "30%", left: "7%", size: "text-xs", delay: "1.7s" },
    { top: "42%", left: "88%", size: "text-sm", delay: "0.4s" },
    { top: "61%", left: "15%", size: "text-xs", delay: "1.1s" },
    { top: "72%", left: "82%", size: "text-base", delay: "2.1s" },
    { top: "86%", left: "28%", size: "text-sm", delay: "1.4s" },
  ];

  return (
    <section className="hero-bg relative overflow-hidden min-h-screen flex flex-col items-center justify-start text-center px-4 pt-24 pb-20">
      <div className="pointer-events-none absolute inset-0 animate-hero-grid opacity-20 [background-image:linear-gradient(to_right,rgba(148,163,184,0.18)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.18)_1px,transparent_1px)] [background-size:48px_48px]" />
      <div className="pointer-events-none absolute -top-20 -left-16 h-72 w-72 rounded-full bg-blue-500/25 blur-3xl animate-hero-orb" />
      <div className="pointer-events-none absolute top-24 -right-10 h-80 w-80 rounded-full bg-violet-400/15 blur-3xl animate-hero-orb [animation-delay:2s]" />
      <div className="pointer-events-none absolute -bottom-20 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-cyan-400/10 blur-3xl animate-hero-orb [animation-delay:4s]" />
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {sparkles.map((sparkle) => (
          <span key={`${sparkle.top}-${sparkle.left}`} className={`absolute ${sparkle.size} text-blue-200/80 animate-hero-twinkle select-none`} style={{ top: sparkle.top, left: sparkle.left, animationDelay: sparkle.delay }}>✦</span>
        ))}
      </div>

      {/* Badge */}
      <div className="relative z-10 mb-8 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-400/25 bg-blue-600/10 text-blue-100 text-xs font-medium tracking-wide">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 ring-2 ring-white/20 animate-pulse" />
        Trusted by over 300 traders worldwide
      </div>

      <h1 className="relative z-10 max-w-3xl text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-[1.08] tracking-tight mb-7">
        Be the <span className="text-gradient">goat</span><br className="hidden sm:block" /> on prediction markets
      </h1>

      <p className="relative z-10 max-w-lg text-lg text-white/55 mb-10 leading-relaxed">
        AI analysis, expert picks, copy trading, and live BTC signals — everything you need to win on Polymarket and Kalshi.
      </p>

      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
        <Link href="/start" className="group flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold text-sm hover:from-blue-500 hover:to-blue-400 transition-all shadow-lg shadow-blue-950/60 ring-1 ring-blue-400/25">
          Start for $1 <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
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

      {/* ── Real Dashboard Screenshot ── */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 animate-float">
        {/* Browser chrome wrapper */}
        <div className="rounded-2xl border border-white/10 overflow-hidden shadow-2xl shadow-black/70 ring-1 ring-white/5">
          {/* Fake browser bar */}
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/8" style={{ background: "#0d1526" }}>
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
            </div>
            <div className="flex-1 mx-4 h-5 rounded-md bg-white/5 flex items-center justify-center">
              <span className="text-[10px] text-white/30">app.polygoat.io/dashboard</span>
            </div>
          </div>
          {/* Screenshot */}
          <Image
            src="/dashboard-preview.png"
            alt="PolyGoat dashboard — AI market analysis, copy trading, BTC signals"
            width={1512}
            height={900}
            className="w-full h-auto block"
            priority
          />
        </div>

        {/* Floating badges */}
        <div className="absolute -top-4 -right-4 sm:-right-2 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-lg shadow-emerald-900/40 border border-emerald-400/30">
          73% Win Rate
        </div>
        <div className="absolute -bottom-4 -left-4 sm:-left-2 bg-gradient-to-br from-blue-600 to-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-lg shadow-blue-900/40 border border-blue-400/30">
          Live BTC Signal ⚡
        </div>
      </div>
    </section>
  );
}
