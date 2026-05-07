"use client";

import { useState } from "react";
import {
  X, Check, Star, Zap, TrendingUp, Shield, ArrowRight,
  Users, Lock, ChevronDown, ChevronUp,
} from "lucide-react";

const PRO_FEATURES = [
  { text: "Unlimited AI market analysis", sub: "Any market, any time" },
  { text: "Copy Trading — mirror top wallets", sub: "Auto-follow winning traders" },
  { text: "BTC Edge live signals", sub: "Real-time 5-min window alerts" },
  { text: "Daily winning picks from analysts", sub: "Curated high-edge plays" },
  { text: "Smart risk scoring per bet", sub: "Know your edge before you bet" },
  { text: "Paper trading simulator", sub: "Practice without real money" },
  { text: "Real-time odds alerts", sub: "Get notified when lines shift" },
];

const TESTIMONIALS = [
  { name: "Marcus T.", handle: "@sharpblocks", text: "Made back the $1 in the first 10 minutes. The AI flagged a mispriced election market I'd never have caught.", gain: "+$1,240 this month", avatar: "MT" },
  { name: "Sarah K.", handle: "@polysharp", text: "The copy trading alone is worth 10x the price. I just mirror the top wallet and collect.", gain: "+$880 this month", avatar: "SK" },
  { name: "Jordan M.", handle: "@edgerunner", text: "BTC Edge signals are insane. 73% win rate on the 5-min windows since I started.", gain: "+$2,100 this month", avatar: "JM" },
];

const FAQS = [
  { q: "What happens after the $1 trial?", a: "After your first month, you're billed $39/month. Cancel any time before then and pay nothing more." },
  { q: "Can I cancel anytime?", a: "Yes — cancel in one click from your account settings. No questions asked, no fees." },
  { q: "Is my payment info safe?", a: "Payments are handled entirely by Stripe. We never see or store your card details." },
  { q: "What if I don't like it?", a: "You'll know within minutes whether this is for you. Most users see their first edge opportunity within the first session." },
];

interface Props {
  onClose: () => void;
  userEmail: string;
  userName: string;
}

export default function UpgradeModal({ onClose, userEmail, userName }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [testimonialIdx, setTestimonialIdx] = useState(0);

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

  const t = TESTIMONIALS[testimonialIdx];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(2,8,20,0.85)", backdropFilter: "blur(8px)" }}>
      <div
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 shadow-2xl"
        style={{ background: "#040a14" }}
      >
        {/* Close */}
        <button onClick={onClose} className="absolute top-4 right-4 z-10 w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
          <X className="w-4 h-4 text-white/50" />
        </button>

        <div className="p-6 pb-2">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-400/20 text-blue-400 text-xs font-semibold mb-4">
            <Zap className="w-3 h-3 fill-blue-400" />
            LIMITED OFFER — First month $1
          </div>

          {/* Headline */}
          <h2 className="text-2xl font-extrabold text-white leading-tight mb-2 tracking-tight">
            Start winning on<br />prediction markets today
          </h2>
          <p className="text-white/40 text-sm mb-5">
            Join 300+ traders using AI to find edge. Try everything free for a month — just $1 to unlock.
          </p>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2 mb-5">
            {[
              { value: "73%", label: "Avg win rate" },
              { value: "$4.2M+", label: "Member profits" },
              { value: "300+", label: "Active traders" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl bg-white/4 border border-white/8 p-3 text-center">
                <p className="text-base font-extrabold text-gradient">{s.value}</p>
                <p className="text-[10px] text-white/30 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Features */}
          <div className="space-y-2 mb-5">
            {PRO_FEATURES.map((f) => (
              <div key={f.text} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{f.text}</p>
                  <p className="text-xs text-white/30">{f.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Testimonial carousel */}
          <div className="rounded-xl bg-white/4 border border-white/8 p-4 mb-5">
            <div className="flex gap-0.5 mb-2">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-blue-400 text-blue-400" />)}
            </div>
            <p className="text-sm text-white/70 leading-relaxed mb-3">&ldquo;{t.text}&rdquo;</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white">{t.avatar}</div>
                <div>
                  <p className="text-xs font-semibold text-white">{t.name}</p>
                  <p className="text-[10px] text-white/30">{t.handle} · <span className="text-emerald-400">{t.gain}</span></p>
                </div>
              </div>
              <div className="flex gap-1">
                {TESTIMONIALS.map((_, i) => (
                  <button key={i} onClick={() => setTestimonialIdx(i)} className={`w-1.5 h-1.5 rounded-full transition-colors ${i === testimonialIdx ? "bg-blue-400" : "bg-white/20"}`} />
                ))}
              </div>
            </div>
          </div>

          {/* Pricing box */}
          <div className="rounded-xl bg-blue-600/10 border border-blue-400/20 p-4 mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-white font-bold text-lg">Pro Plan</span>
              <div className="text-right">
                <span className="text-2xl font-extrabold text-white">$1</span>
                <span className="text-white/40 text-sm"> first month</span>
              </div>
            </div>
            <p className="text-white/30 text-xs">Then $39/month — cancel anytime, no questions asked</p>
          </div>

          {/* CTA */}
          {error && <p className="text-red-400 text-xs mb-3 text-center">{error}</p>}
          <button
            onClick={startTrial}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-base transition-all disabled:opacity-60 shadow-lg shadow-blue-900/40 mb-3"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Start my $1 trial
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Trust signals */}
          <div className="flex items-center justify-center gap-4 mb-5">
            <div className="flex items-center gap-1 text-white/25 text-xs">
              <Lock className="w-3 h-3" />
              Secure checkout
            </div>
            <div className="flex items-center gap-1 text-white/25 text-xs">
              <Shield className="w-3 h-3" />
              Cancel anytime
            </div>
            <div className="flex items-center gap-1 text-white/25 text-xs">
              <Users className="w-3 h-3" />
              300+ traders
            </div>
          </div>

          {/* FAQ */}
          <div className="border-t border-white/8 pt-4 space-y-1">
            <p className="text-xs font-semibold text-white/30 uppercase tracking-wide mb-2">Common questions</p>
            {FAQS.map((faq, i) => (
              <div key={i} className="rounded-lg border border-white/6 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-3 py-2.5 text-left"
                >
                  <span className="text-xs font-medium text-white/70">{faq.q}</span>
                  {openFaq === i ? <ChevronUp className="w-3.5 h-3.5 text-white/30 flex-shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 text-white/30 flex-shrink-0" />}
                </button>
                {openFaq === i && (
                  <div className="px-3 pb-3">
                    <p className="text-xs text-white/40 leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 pt-4">
          <p className="text-center text-[10px] text-white/15">
            By starting a trial you agree to our Terms of Service. Billed by Stripe. Secured by 256-bit SSL.
          </p>
        </div>
      </div>
    </div>
  );
}
