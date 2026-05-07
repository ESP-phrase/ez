"use client";

import Link from "next/link";
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
    <section className="hero-bg relative overflow-hidden min-h-screen flex flex-col items-center justify-start text-center px-4 pt-32 pb-20">
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

      {/* ── Dashboard Mockup (High-Fidelity) ── */}
      <div className="relative z-10 w-full max-w-6xl mx-auto animate-float">
        <div className="rounded-2xl border border-white/10 overflow-hidden shadow-2xl shadow-black/60 ring-1 ring-white/5" style={{ background: "#f8f9fa" }}>

          {/* Browser chrome */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200" style={{ background: "#ffffff" }}>
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
            </div>
            <div className="flex-1 mx-4 h-5 rounded-md bg-gray-100 flex items-center justify-center">
              <span className="text-[10px] text-gray-400">app.polygoat.io/dashboard</span>
            </div>
          </div>

          <div className="flex" style={{ minHeight: 480, background: "#fafbfc" }}>
            {/* Sidebar */}
            <div className="w-56 border-r border-gray-200 flex flex-col gap-1 px-4 py-5 flex-shrink-0 bg-white">
              {/* Logo */}
              <div className="flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">🐐</div>
                <div>
                  <div className="text-xs font-bold text-gray-900">PolyGoat</div>
                  <div className="text-[11px] text-gray-500">Trader workspace</div>
                </div>
              </div>
              {/* Nav items */}
              {[
                { icon: "📊", label: "AI Analyzer", color: "text-blue-600" },
                { icon: "📋", label: "Copy Trader", color: "text-indigo-600" },
                { icon: "⚡", label: "BTC Edge", color: "text-violet-600", highlight: true },
                { icon: "🧪", label: "BTC Backtest", color: "text-emerald-600" },
                { icon: "🏆", label: "Leaderboard", color: "text-amber-600", active: true },
              ].map((item, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                    item.active
                      ? "bg-amber-500 text-white shadow-sm"
                      : item.highlight
                      ? "bg-violet-50 text-violet-700 border border-violet-200"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  {item.label}
                </div>
              ))}
            </div>

            {/* Main content */}
            <div className="flex-1 p-6 space-y-5 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-blue-600 tracking-wider uppercase mb-1">Daily Briefing</div>
                  <div className="text-xl font-bold text-gray-900">Welcome back, Lkhjlkhlk</div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="w-9 h-9 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-400 hover:border-gray-300">🔔</button>
                  <button className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700">Start trial</button>
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-xs font-bold text-white">LK</div>
                </div>
              </div>

              {/* Stat cards */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { icon: "📈", label: "Win-rate trend", value: "68.4%", sub: "+5.2% this week", color: "blue" },
                  { icon: "⚡", label: "Active signals", value: "14", sub: "5 high conviction", color: "violet" },
                  { icon: "$", label: "Paper P&L", value: "+$124.90", sub: "Unrealized", color: "emerald" },
                ].map((card, i) => (
                  <div key={i} className="rounded-xl border border-gray-200 bg-white p-4 flex items-start gap-3">
                    <span className="text-xl">{card.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{card.label}</div>
                      <div className="text-2xl font-bold text-gray-900 mt-1">{card.value}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{card.sub}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick links */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-violet-200 bg-gradient-to-br from-violet-50 to-white p-4 flex items-center gap-3 cursor-pointer hover:shadow-sm transition-all">
                  <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center text-lg flex-shrink-0">⚡</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-900">BTC Edge</div>
                    <div className="text-xs text-gray-500 mt-0.5">Live 5-min market · Price to beat · Real-time signal</div>
                  </div>
                  <span className="text-gray-400">→</span>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-4 flex items-center gap-3 cursor-pointer hover:shadow-sm transition-all">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-lg flex-shrink-0">🧪</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-900">Paper Trading</div>
                    <div className="text-xs text-gray-500 mt-0.5">Simulate trades risk-free on live markets</div>
                  </div>
                  <span className="text-gray-400">→</span>
                </div>
              </div>

              {/* AI Analyzer section */}
              <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🤖</span>
                    <span className="text-sm font-semibold text-gray-900">AI Analyzer</span>
                  </div>
                  <span className="text-gray-400">−</span>
                </div>
                <p className="text-xs text-gray-600 mb-3">Upload a market screenshot and get an instant AI-powered recommendation.</p>
                <div className="rounded-lg border-2 border-dashed border-blue-300 bg-white/60 p-8 flex items-center justify-center mb-3">
                  <div className="text-center">
                    <div className="text-2xl mb-2">⬆️</div>
                    <div className="text-xs text-gray-600">Drop a market screenshot or click to upload</div>
                    <div className="text-[11px] text-gray-400 mt-1">PNG, JPEG, WebP</div>
                  </div>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700">
                  🔍 Analyze
                </button>
              </div>

              {/* Copy Trader section */}
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📋</span>
                    <span className="text-sm font-semibold text-gray-900">Copy Trader</span>
                  </div>
                  <span className="text-gray-400">−</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">Follow top wallets and mirror their trades with configurable risk limits.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Floating badges */}
        <div className="absolute -top-4 -right-4 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-lg shadow-emerald-900/40 border border-emerald-400/30">
          73% Win Rate
        </div>
        <div className="absolute -bottom-4 -left-4 bg-gradient-to-br from-blue-600 to-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-lg shadow-blue-900/40 border border-blue-400/30">
          Live BTC Signal ⚡
        </div>
      </div>
    </section>
  );
}
