"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/dashboard/sidebar";
import AnalyzerPanel from "@/components/dashboard/analyzer-panel";
import CopyPanel from "@/components/dashboard/copy-panel";
import UpgradeModal from "@/components/dashboard/upgrade-modal";
import {
  ScanSearch,
  Copy,
  Zap,
  FlaskConical,
  ChevronDown,
  ChevronRight,
  Bell,
  TrendingUp,
  Activity,
  DollarSign,
  LogOut,
  PartyPopper,
  X,
  Settings,
} from "lucide-react";

interface User { email: string; name: string; plan?: string }

const MOCK_PICKS = [
  { market: "Will the Fed cut rates in June 2026?", platform: "Polymarket", confidence: 82, verdict: "YES", edge: "+14%" },
  { market: "Bitcoin above $110k by end of May?", platform: "Kalshi", confidence: 67, verdict: "NO", edge: "+8%" },
  { market: "Trump approval rating above 50%?", platform: "Polymarket", confidence: 74, verdict: "NO", edge: "+11%" },
];

function StatCard({ label, value, sub, icon: Icon, accent }: {
  label: string; value: string; sub: string;
  icon: React.ElementType; accent: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 flex items-start gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${accent}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-slate-900 mt-0.5">{value}</p>
        <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
      </div>
    </div>
  );
}

function Section({ title, icon: Icon, color, children, defaultOpen = true }: {
  title: string; icon: React.ElementType; color: string;
  children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${color}`}>
            <Icon className="w-3.5 h-3.5" />
          </div>
          <span className="text-sm font-semibold text-slate-900">{title}</span>
        </div>
        {open ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
      </button>
      {open && <div className="px-5 pb-5 border-t border-slate-100">{children}</div>}
    </div>
  );
}

function ConfidenceBadge({ value }: { value: number }) {
  const cls = value >= 75
    ? "text-emerald-700 bg-emerald-50 border-emerald-200"
    : value >= 60
    ? "text-blue-700 bg-blue-50 border-blue-200"
    : "text-slate-600 bg-slate-100 border-slate-200";
  return <span className={`px-2 py-0.5 rounded-full border text-[11px] font-bold ${cls}`}>{value}%</span>;
}

function SuccessBanner({ sessionId, onDismiss }: { sessionId: string; onDismiss: () => void }) {
  useEffect(() => {
    fetch(`/api/stripe/success?session_id=${sessionId}`)
      .then((r) => r.json())
      .then((data: { plan?: string }) => {
        if (data.plan) {
          try {
            const raw = localStorage.getItem("pg_user");
            const u = raw ? JSON.parse(raw) : {};
            localStorage.setItem("pg_user", JSON.stringify({ ...u, plan: data.plan }));
          } catch { /* ignore */ }

          // TikTok conversion event
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const ttq = (window as any).ttq;
            if (ttq) {
              ttq.track("Subscribe", { value: 1.00, currency: "USD" });
            }
          } catch { /* ignore */ }
        }
      })
      .catch(() => { /* ignore */ });
  }, [sessionId]);

  return (
    <div className="mx-8 mt-4 flex items-center gap-3 rounded-xl bg-emerald-50 border border-emerald-200 px-5 py-3.5">
      <PartyPopper className="w-5 h-5 text-emerald-600 flex-shrink-0" />
      <p className="flex-1 text-sm font-semibold text-emerald-800">
        🎉 Welcome to Pro! Your subscription is active — all features are now unlocked.
      </p>
      <button onClick={onDismiss} className="text-emerald-500 hover:text-emerald-700 transition-colors">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

function DashboardInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showSuccess, setShowSuccess] = useState(!!sessionId);

  useEffect(() => {
    setMounted(true);
    const auth = localStorage.getItem("pg_auth");
    if (auth !== "true") {
      router.replace("/login");
      return;
    }

    try {
      const raw = localStorage.getItem("pg_user");
      const userData = raw ? JSON.parse(raw) : { email: "trader@polygoat.io", name: "trader" };
      setUser(userData);
    } catch {
      setUser({ email: "trader@polygoat.io", name: "trader" });
    }

    // Clean session_id from URL without page reload
    if (sessionId) {
      const url = new URL(window.location.href);
      url.searchParams.delete("session_id");
      window.history.replaceState({}, "", url.toString());
    }
  }, [router, sessionId]);

  if (!mounted || !user) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-5 h-5 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin" />
    </div>
  );

  const isPro = user.plan === "PRO" || user.plan === "ELITE";
  const displayName = user.name.charAt(0).toUpperCase() + user.name.slice(1);
  const initials = user.name.slice(0, 2).toUpperCase();

  return (
    <div className="flex min-h-screen bg-slate-50" suppressHydrationWarning>
      {showUpgrade && (
        <UpgradeModal
          onClose={() => setShowUpgrade(false)}
          userEmail={user.email}
          userName={user.name}
        />
      )}
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="flex items-center justify-between px-8 py-4 border-b border-slate-200 sticky top-0 z-30 bg-white/95 backdrop-blur">
          <div>
            <p className="text-xs font-semibold tracking-wide text-blue-600 uppercase">Daily Briefing</p>
            <p className="text-lg font-semibold text-slate-900">Welcome back, {displayName}</p>
          </div>
          <div className="flex items-center gap-2.5">
            <button className="relative w-9 h-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center hover:border-slate-300 transition-all">
              <Bell className="w-4 h-4 text-slate-500" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 ring-2 ring-white" />
            </button>
            {!isPro && (
              <button
                onClick={() => setShowUpgrade(true)}
                className="px-3 py-2 rounded-xl border border-blue-200 bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-all"
              >
                Start trial
              </button>
            )}
            {isPro && (
              <span className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                PRO ✓
              </span>
            )}
            <Link
              href="/dashboard/settings"
              className="w-9 h-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center hover:border-slate-300 transition-all"
              title="Settings"
            >
              <Settings className="w-4 h-4 text-slate-400" />
            </Link>
            <div className="flex items-center gap-1.5 cursor-pointer group rounded-xl border border-slate-200 bg-white px-2 py-1.5">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-[11px] font-bold text-white">
                {initials}
              </div>
              <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-slate-600 transition-colors" />
            </div>
            <button
              onClick={() => { localStorage.removeItem("pg_auth"); localStorage.removeItem("pg_user"); window.location.href = "/login"; }}
              className="w-9 h-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center hover:border-red-200 hover:bg-red-50 transition-all group"
              title="Log out"
            >
              <LogOut className="w-4 h-4 text-slate-400 group-hover:text-red-500 transition-colors" />
            </button>
          </div>
        </header>

        {/* Post-payment success banner */}
        {showSuccess && sessionId && (
          <SuccessBanner sessionId={sessionId} onDismiss={() => setShowSuccess(false)} />
        )}

        {/* Free user upgrade nudge */}
        {!isPro && !showSuccess && (
          <div className="mx-8 mt-4 flex items-center justify-between rounded-xl bg-blue-50 border border-blue-200 px-5 py-3">
            <div className="flex items-center gap-2.5">
              <Zap className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <p className="text-sm text-blue-800 font-medium">You&apos;re on the free plan. Unlock all features for just <strong>$1</strong> your first month.</p>
            </div>
            <button
              onClick={() => setShowUpgrade(true)}
              className="ml-4 flex-shrink-0 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-all"
            >
              Upgrade
            </button>
          </div>
        )}

        <main className="flex-1 p-8 space-y-6 max-w-5xl mx-auto w-full">

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard label="Win-rate trend" value="68.4%" sub="+5.2% this week" icon={TrendingUp} accent="bg-blue-50 text-blue-600" />
            <StatCard label="Active signals" value="14" sub="5 high conviction" icon={Activity} accent="bg-violet-50 text-violet-600" />
            <StatCard label="Paper P&L" value="+$124.90" sub="Unrealized" icon={DollarSign} accent="bg-emerald-50 text-emerald-600" />
          </div>

          {/* Quick links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              href="/dashboard/btc-edge"
              className="group flex items-center gap-4 rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-white px-5 py-4 hover:border-violet-300 hover:shadow-sm transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0">
                <Zap className="w-5 h-5 text-violet-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900">BTC Edge</p>
                <p className="text-xs text-slate-500 mt-0.5">Live 5-min market · Price to beat · Real-time signal</p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-violet-500 transition-colors" />
            </Link>

            <Link
              href="/dashboard/paper-trading"
              className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 hover:border-blue-200 hover:shadow-sm transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                <FlaskConical className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900">Paper Trading</p>
                <p className="text-xs text-slate-500 mt-0.5">Simulate trades risk-free on live markets</p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
            </Link>
          </div>

          {/* AI Analyzer — inline */}
          <Section title="AI Analyzer" icon={ScanSearch} color="bg-blue-100 text-blue-600" defaultOpen={true}>
            <div className="pt-4">
              <p className="text-xs text-slate-500 mb-4">Upload a market screenshot and get an instant AI-powered recommendation.</p>
              <AnalyzerPanel userEmail={user.email} userName={user.name} />
            </div>
          </Section>

          {/* Copy Trader — inline */}
          <Section title="Copy Trader" icon={Copy} color="bg-indigo-100 text-indigo-600" defaultOpen={true}>
            <div className="pt-4">
              <p className="text-xs text-slate-500 mb-4">Follow top wallets and mirror their trades with configurable risk limits.</p>
              <CopyPanel userEmail={user.email} userName={user.name} />
            </div>
          </Section>

          {/* Today's Picks */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-900">Today&apos;s AI Picks</h2>
              <Link href="#" className="text-xs text-blue-600 hover:text-blue-700 transition-colors">See all →</Link>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden divide-y divide-slate-100">
              {MOCK_PICKS.map((pick) => (
                <div key={pick.market} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-900 truncate">{pick.market}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{pick.platform}</p>
                  </div>
                  <div className="flex items-center gap-2.5 flex-shrink-0">
                    <ConfidenceBadge value={pick.confidence} />
                    <span className={`px-2 py-0.5 rounded-lg text-[11px] font-bold ${pick.verdict === "YES" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                      {pick.verdict}
                    </span>
                    <span className="text-xs font-semibold text-slate-400 hidden sm:block">{pick.edge}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-5 h-5 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin" />
      </div>
    }>
      <DashboardInner />
    </Suspense>
  );
}
