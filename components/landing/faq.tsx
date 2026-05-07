"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "Does it actually work?",
    a: "Yes. Our AI has been trained on thousands of resolved prediction market events. Our public track record shows a 73% average win rate on high-confidence picks. Results vary, but the edge is real and verifiable.",
  },
  {
    q: "What makes PolyGoat better than doing my own research?",
    a: "Speed and scale. Our AI processes news articles, social signals, and historical resolution data in seconds — something that would take a researcher hours. We surface mispricings before the market corrects.",
  },
  {
    q: "Which platforms does PolyGoat work with?",
    a: "PolyGoat works with any market you can screenshot — Polymarket, Kalshi, PredictIt, Manifold, and more. Copy trading is currently supported on Polymarket via API.",
  },
  {
    q: "How fast is the analysis?",
    a: "Most analyses complete in under 10 seconds. We run parallel news scans, sentiment analysis, and historical lookups so you get results before the market moves.",
  },
  {
    q: "Do I need prior experience with prediction markets?",
    a: "No experience needed. The AI Coach walks beginners through strategy, and paper trading lets you learn risk-free. Most users are profitable within their first two weeks.",
  },
  {
    q: "Is my money safe?",
    a: "PolyGoat never holds or touches your funds. For copy trading we use execution-only API keys — we cannot initiate withdrawals. Your wallet, your funds, always.",
  },
  {
    q: "Can I try before committing?",
    a: "Yes. Your first month is just $1 — full access to every feature. Cancel before the month ends and you won't be charged again. No questions asked.",
  },
  {
    q: "How do I cancel?",
    a: "Cancel from account settings in one click, any time. Access continues until end of billing period. No hidden fees, no cancellation penalties.",
  },
];

export default function Faq() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="py-28 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs text-blue-400 font-semibold tracking-widest uppercase mb-3">FAQ</p>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Common questions</h2>
        </div>

        <div className="space-y-1.5">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className={`surface-card rounded-xl overflow-hidden transition-all ${open === i ? "border-blue-400/20" : ""}`}
            >
              <button
                className="w-full flex items-center justify-between px-5 py-4 text-left gap-4"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span className="text-sm font-medium text-white">{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 flex-shrink-0 transition-transform ${
                    open === i ? "rotate-180 text-blue-400" : "text-white/25"
                  }`}
                />
              </button>
              {open === i && (
                <div className="px-5 pb-5 text-white/45 text-sm leading-relaxed border-t border-white/5 pt-4">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
