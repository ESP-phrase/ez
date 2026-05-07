"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TrendingUp, ArrowRight, Star, Mail, RotateCcw } from "lucide-react";

type Step = "email" | "code";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const codeRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("pg_auth") === "true") {
      router.replace("/dashboard");
    }
  }, [router]);

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  const sendCode = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError("");
    if (!email || !email.includes("@")) { setError("Enter a valid email address."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await res.json() as { ok?: boolean; error?: string };
      if (!res.ok || json.error) { setError(json.error ?? "Failed to send code."); return; }
      setStep("code");
      setResendCooldown(60);
      setTimeout(() => codeRefs.current[0]?.focus(), 100);
    } catch {
      setError("Could not reach server.");
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async (fullCode: string) => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: fullCode }),
      });
      const json = await res.json() as { user?: { email: string; name: string }; error?: string };
      if (!res.ok || json.error) { setError(json.error ?? "Verification failed."); setLoading(false); return; }
      if (json.user) {
        localStorage.setItem("pg_auth", "true");
        localStorage.setItem("pg_user", JSON.stringify(json.user));
        router.push("/dashboard");
      }
    } catch {
      setError("Could not reach server.");
      setLoading(false);
    }
  };

  const handleCodeChange = (i: number, val: string) => {
    if (!/^\d*$/.test(val)) return; // digits only
    const next = [...code];
    // Allow paste of full 6-digit code
    if (val.length > 1) {
      const digits = val.replace(/\D/g, "").slice(0, 6).split("");
      const filled = [...code];
      digits.forEach((d, idx) => { if (idx < 6) filled[idx] = d; });
      setCode(filled);
      const focus = Math.min(digits.length, 5);
      codeRefs.current[focus]?.focus();
      if (digits.length === 6) verifyCode(digits.join(""));
      return;
    }
    next[i] = val;
    setCode(next);
    if (val && i < 5) codeRefs.current[i + 1]?.focus();
    if (next.every((d) => d !== "")) verifyCode(next.join(""));
  };

  const handleCodeKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[i] && i > 0) {
      codeRefs.current[i - 1]?.focus();
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "#040a14" }}>
      {/* Left: Branding */}
      <div className="hidden lg:flex flex-col justify-between w-[44%] p-12 border-r border-white/5">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600/15 border border-blue-400/30 flex items-center justify-center ring-1 ring-white/10">
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </div>
          <span className="text-base font-bold text-white tracking-tight">
            Poly<span className="text-gradient">Goat</span>
          </span>
        </Link>

        <div>
          <blockquote className="text-xl font-semibold text-white leading-snug mb-6">
            &ldquo;Made back my subscription cost in the first day. The AI flagged a mispriced election
            market I never would&apos;ve caught on my own.&rdquo;
          </blockquote>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white">
              MT
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Marcus T.</p>
              <p className="text-xs text-white/35">@sharpblocks · +$1,240 this month</p>
            </div>
          </div>
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3 h-3 fill-blue-400 text-blue-400" />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { value: "300+", label: "Traders" },
            { value: "73%", label: "Win Rate" },
            { value: "$4.2M+", label: "Profits" },
          ].map((s) => (
            <div key={s.label} className="surface-card rounded-xl p-4 text-center">
              <p className="text-lg font-extrabold text-gradient">{s.value}</p>
              <p className="text-[11px] text-white/30">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <Link href="/" className="flex items-center gap-2.5 mb-10 lg:hidden">
          <div className="w-7 h-7 rounded-lg bg-blue-600/15 border border-blue-400/30 flex items-center justify-center">
            <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <span className="text-base font-bold text-white tracking-tight">
            Poly<span className="text-gradient">Goat</span>
          </span>
        </Link>

        <div className="w-full max-w-sm">
          {step === "email" ? (
            <>
              {/* Email step */}
              <div className="w-12 h-12 rounded-2xl bg-blue-600/15 border border-blue-400/20 flex items-center justify-center mb-6">
                <Mail className="w-5 h-5 text-blue-400" />
              </div>
              <h1 className="text-2xl font-extrabold text-white mb-1 tracking-tight">Sign in to PolyGoat</h1>
              <p className="text-white/35 text-sm mb-8">
                Enter your email and we&apos;ll send you a 6-digit code — no password needed.
              </p>

              <form onSubmit={sendCode} className="space-y-4">
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
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Send code
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <>
              {/* Code step */}
              <div className="w-12 h-12 rounded-2xl bg-blue-600/15 border border-blue-400/20 flex items-center justify-center mb-6">
                <Mail className="w-5 h-5 text-blue-400" />
              </div>
              <h1 className="text-2xl font-extrabold text-white mb-1 tracking-tight">Check your email</h1>
              <p className="text-white/35 text-sm mb-2">
                We sent a 6-digit code to
              </p>
              <p className="text-blue-400 text-sm font-semibold mb-8">{email}</p>

              {/* 6-digit code input */}
              <div className="flex gap-2 mb-6 justify-center">
                {code.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { codeRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={digit}
                    onChange={(e) => handleCodeChange(i, e.target.value)}
                    onKeyDown={(e) => handleCodeKeyDown(i, e)}
                    className="w-11 h-14 rounded-xl surface-card text-white text-xl font-bold text-center focus:outline-none focus:border-blue-400/60 transition-colors caret-transparent"
                    style={{ border: "1px solid rgba(255,255,255,0.08)" }}
                  />
                ))}
              </div>

              {loading && (
                <div className="flex justify-center mb-4">
                  <div className="w-5 h-5 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
                </div>
              )}

              {error && <p className="text-red-400 text-xs px-1 mb-4 text-center">{error}</p>}

              <p className="text-center text-white/30 text-xs mb-3">Didn&apos;t get it?</p>
              <div className="flex gap-2">
                <button
                  onClick={() => { setStep("email"); setCode(["","","","","",""]); setError(""); }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl surface-card text-white/40 hover:text-white/70 text-xs font-medium transition-colors"
                >
                  Change email
                </button>
                <button
                  onClick={() => sendCode()}
                  disabled={resendCooldown > 0 || loading}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl surface-card text-white/40 hover:text-white/70 text-xs font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <RotateCcw className="w-3 h-3" />
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
                </button>
              </div>
            </>
          )}

          <p className="text-center text-[11px] text-white/20 mt-8">
            By continuing, you agree to our{" "}
            <Link href="#" className="underline hover:text-white/40">Terms</Link>{" "}
            and{" "}
            <Link href="#" className="underline hover:text-white/40">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
