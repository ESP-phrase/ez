"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/dashboard/sidebar";
import {
  ArrowLeft,
  User,
  CreditCard,
  Mail,
  Crown,
  LogOut,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";

interface UserData {
  email: string;
  name: string;
  plan?: string;
}

function PlanBadge({ plan }: { plan?: string }) {
  if (plan === "PRO" || plan === "ELITE") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-bold">
        <Crown className="w-3 h-3" />
        {plan} — Active
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold">
      FREE
    </span>
  );
}

function SettingsInner() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [portalError, setPortalError] = useState("");

  useEffect(() => {
    setMounted(true);
    const auth = localStorage.getItem("pg_auth");
    if (auth !== "true") {
      router.replace("/login");
      return;
    }
    try {
      const raw = localStorage.getItem("pg_user");
      const userData = raw ? JSON.parse(raw) : { email: "", name: "" };
      setUser(userData);
    } catch {
      setUser({ email: "", name: "" });
    }
  }, [router]);

  const openCustomerPortal = async () => {
    if (!user?.email) return;
    setPortalLoading(true);
    setPortalError("");
    try {
      const res = await fetch("/api/stripe/customer-portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
      });
      const data = await res.json() as { url?: string; error?: string };
      if (data.url) {
        window.location.href = data.url;
      } else {
        setPortalError(data.error ?? "Could not open billing portal.");
        setPortalLoading(false);
      }
    } catch {
      setPortalError("Network error. Please try again.");
      setPortalLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("pg_auth");
    localStorage.removeItem("pg_user");
    window.location.href = "/login";
  };

  if (!mounted || !user) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-5 h-5 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin" />
    </div>
  );

  const isPro = user.plan === "PRO" || user.plan === "ELITE";
  const initials = (user.name || user.email || "?").slice(0, 2).toUpperCase();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center gap-4 px-8 py-4 border-b border-slate-200 bg-white/95 backdrop-blur sticky top-0 z-30">
          <Link href="/dashboard" className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" />
            Dashboard
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-sm font-semibold text-slate-900">Account Settings</span>
        </header>

        <main className="flex-1 p-8 max-w-2xl mx-auto w-full space-y-5">

          {/* Profile */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white font-bold text-base flex-shrink-0">
                {initials}
              </div>
              <div>
                <p className="font-semibold text-slate-900">{user.name || "—"}</p>
                <p className="text-sm text-slate-500">{user.email}</p>
              </div>
              <div className="ml-auto">
                <PlanBadge plan={user.plan} />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 rounded-xl bg-slate-50 border border-slate-100 px-4 py-3">
                <User className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-400 font-medium">Display name</p>
                  <p className="text-sm text-slate-900 font-semibold">{user.name || "—"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-slate-50 border border-slate-100 px-4 py-3">
                <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-400 font-medium">Email</p>
                  <p className="text-sm text-slate-900 font-semibold truncate">{user.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Subscription */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-slate-500" />
              Subscription
            </h2>
            <p className="text-xs text-slate-400 mb-5">Manage your plan, billing details, and cancellation.</p>

            {isPro ? (
              <>
                <div className="flex items-center justify-between rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3.5 mb-4">
                  <div className="flex items-center gap-2.5">
                    <Crown className="w-4 h-4 text-emerald-600" />
                    <div>
                      <p className="text-sm font-bold text-emerald-800">{user.plan} Plan</p>
                      <p className="text-xs text-emerald-600">$39 / month · Renews automatically</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">ACTIVE</span>
                </div>

                {portalError && (
                  <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2 mb-3">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                    <p className="text-xs text-red-600">{portalError}</p>
                  </div>
                )}

                <button
                  onClick={openCustomerPortal}
                  disabled={portalLoading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold transition-all disabled:opacity-60"
                >
                  {portalLoading ? (
                    <div className="w-4 h-4 border-2 border-slate-200 border-t-slate-600 rounded-full animate-spin" />
                  ) : (
                    <>
                      Manage billing & cancel
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                    </>
                  )}
                </button>
                <p className="text-[11px] text-slate-400 text-center mt-2">Opens Stripe&apos;s secure billing portal. Cancel anytime — no fees.</p>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-200 px-4 py-3.5 mb-4">
                  <div>
                    <p className="text-sm font-bold text-slate-800">Free Plan</p>
                    <p className="text-xs text-slate-500">Limited features — upgrade to unlock everything</p>
                  </div>
                  <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">FREE</span>
                </div>
                <Link
                  href="/start"
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-all shadow-md shadow-blue-900/20"
                >
                  Upgrade to Pro — $1 first month
                </Link>
                <p className="text-[11px] text-slate-400 text-center mt-2">Then $39/month · Cancel anytime</p>
              </>
            )}
          </div>

          {/* Danger zone */}
          <div className="rounded-2xl border border-red-100 bg-white p-6">
            <h2 className="text-base font-bold text-slate-900 mb-1">Sign out</h2>
            <p className="text-xs text-slate-400 mb-4">You&apos;ll be redirected to the login page.</p>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-200 bg-red-50 text-red-600 text-sm font-semibold hover:bg-red-100 transition-all"
            >
              <LogOut className="w-4 h-4" />
              Log out
            </button>
          </div>

        </main>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-5 h-5 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin" />
      </div>
    }>
      <SettingsInner />
    </Suspense>
  );
}
