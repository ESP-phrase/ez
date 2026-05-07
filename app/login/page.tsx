"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { TrendingUp, ArrowRight, Star, Mail, RotateCcw } from "lucide-react";
import GoatLogo from "@/components/goat-logo";

type Step = "email" | "code";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [googleError, setGoogleError] = useState("");
  const codeRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("pg_auth") === "true") {
      router.replace("/dashboard");
    }
    const err = params.get("error");
    if (err) setGoogleError("Google sign-in failed. Please try again.");
  }, [router, params]);

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
    if (!/^\d*$/.test(val)) return;
    const next = [...code];
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
    if (e.key === "Backspace" && !code[i] && i > 0) codeRefs.current[i - 1]?.focus();
  };

  return (
    <div className="min-h-screen flex" style={{ background: "#040a14" }}>
      {/* Left: Branding */}
      <div className="hidden lg:flex flex-col justify-between w-[44%] p-12 border-r border-white/5">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600/15 border border-blue-400/30 flex items-center justify-center ring-1 ring-white/10">
            <GoatLogo size={20} />
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
            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white">MT</div>
            <div>
              <p className="text-sm font-semibold text-white">Marcus T.</p>
              <p className="text-xs text-white/35">@sharpblocks · +$1,240 this month</p>
            </div>
          </div>
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-blue-400 text-blue-400" />)}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[{ value: "300+", label: "Traders" }, { value: "73%", label: "Win Rate" }, { value: "$4.2M+", label: "Profits" }].map((s) => (
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
            <GoatLogo size={18} />
          </div>
          <span className="text-base font-bold text-white tracking-tight">
            Poly<span className="text-gradient">Goat</span>
          </span>
        </Link>

        <div className="w-full max-w-sm">
          {step === "email" ? (
            <>
              <div className="w-12 h-12 rounded-2xl bg-blue-600/15 border border-blue-400/20 flex items-center justify-center mb-6">
                <GoatLogo size={28} />
              </div>
              <h1 className="text-2xl font-extrabold text-white mb-1 tracking-tight">Sign in to PolyGoat</h1>
              <p className="text-white/35 text-sm mb-6">Enter your email and we&apos;ll send you a 6-digit code — no password needed.</p>

              {googleError && <p className="text-red-400 text-xs px-1 mb-3">{googleError}</p>}
              <a
                href="/api/auth/google"
                className="w-full flex items-center justify-center gap-3 py-2.5 rounded-xl surface-card text-white/80 hover:text-white text-sm font-medium transition-all hover:bg-white/5 mb-4"
                style={{ border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
                  <path d="M47.5 24.5c0-1.6-.1-3.2-.4-4.7H24v8.9h13.2c-.6 3-2.3 5.5-4.9 7.2v6h7.9c4.6-4.3 7.3-10.5 7.3-17.4z" fill="#4285F4"/>
                  <path d="M24 48c6.5 0 12-2.2 16-5.9l-7.9-6c-2.2 1.5-5 2.3-8.1 2.3-6.2 0-11.5-4.2-13.4-9.9H2.5v6.2C6.5 42.6 14.7 48 24 48z" fill="#34A853"/>
                  <path d="M10.6 28.5A14.9 14.9 0 0 1 10.6 19.5v-6.2H2.5A23.9 23.9 0 0 0 0 24c0 3.9.9 7.5 2.5 10.7l8.1-6.2z" fill="#FBBC05"/>
                  <path d="M24 9.5c3.5 0 6.6 1.2 9.1 3.5l6.8-6.8C35.9 2.2 30.5 0 24 0 14.7 0 6.5 5.4 2.5 13.3l8.1 6.2C12.5 13.7 17.8 9.5 24 9.5z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </a>

              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-white/8" />
                <span className="text-white/20 text-xs">or</span>
                <div className="flex-1 h-px bg-white/8" />
              </div>

              <form onSubmit={sendCode} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-white/40 mb-1.5">Email address</label>
                  <input
                    type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com" autoFocus
                    className="w-full px-4 py-2.5 rounded-xl surface-card text-white placeholder-white/15 text-sm focus:outline-none focus:border-blue-400/40 transition-colors"
                  />
                </div>
                {error && <p className="text-red-400 text-xs px-1">{error}</p>}
                <button type="submit" disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2">
                  {loading ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <><span>Send code</span><ArrowRight className="w-4 h-4" /></>}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-2xl bg-blue-600/15 border border-blue-400/20 flex items-center justify-center mb-6">
                <GoatLogo size={28} />
              </div>
              <h1 className="text-2xl font-extrabold text-white mb-1 tracking-tight">Check your email</h1>
              <p className="text-white/35 text-sm mb-2">We sent a 6-digit code to</p>
              <p className="text-blue-400 text-sm font-semibold mb-8">{email}</p>

              <div className="flex gap-2 mb-6 justify-center">
                {code.map((digit, i) => (
                  <input key={i} ref={(el) => { codeRefs.current[i] = el; }}
                    type="text" inputMode="numeric" maxLength={6} value={digit}
                    onChange={(e) => handleCodeChange(i, e.target.value)}
                    onKeyDown={(e) => handleCodeKeyDown(i, e)}
                    className="w-11 h-14 rounded-xl surface-card text-white text-xl font-bold text-center focus:outline-none focus:border-blue-400/60 transition-colors caret-transparent"
                    style={{ border: "1px solid rgba(255,255,255,0.08)" }}
                  />
                ))}
              </div>

              {loading && <div className="flex justify-center mb-4"><div className="w-5 h-5 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" /></div>}
              {error && <p className="text-red-400 text-xs px-1 mb-4 text-center">{error}</p>}

              <p className="text-center text-white/30 text-xs mb-3">Didn&apos;t get it?</p>
              <div className="flex gap-2">
                <button onClick={() => { setStep("email"); setCode(["","","","","",""]); setError(""); }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl surface-card text-white/40 hover:text-white/70 text-xs font-medium transition-colors">
                  Change email
                </button>
                <button onClick={() => sendCode()} disabled={resendCooldown > 0 || loading}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl surface-card text-white/40 hover:text-white/70 text-xs font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                  <RotateCcw className="w-3 h-3" />
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
                </button>
              </div>
            </>
          )}

          <p className="text-center text-[11px] text-white/20 mt-8">
            By continuing, you agree to our{" "}
            <Link href="#" className="underline hover:text-white/40">Terms</Link>{" "}and{" "}
            <Link href="#" className="underline hover:text-white/40">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
