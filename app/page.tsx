import type { Metadata } from "next";
import Navbar from "@/components/landing/navbar";
import Hero from "@/components/landing/hero";
import HowItWorks from "@/components/landing/how-it-works";
import Features from "@/components/landing/features";
import SocialProof from "@/components/landing/social-proof";
import Pricing from "@/components/landing/pricing";
import Faq from "@/components/landing/faq";
import Footer from "@/components/landing/footer";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "PolyGoat — AI Trading Tools for Polymarket & Kalshi",
  description:
    "Get an unfair edge on prediction markets. AI market analysis, expert daily picks, copy trading, and live BTC signals. Trusted by 300+ traders. Start for $1.",
  alternates: { canonical: "https://polygoat.io" },
  openGraph: {
    title: "PolyGoat — AI Trading Tools for Polymarket & Kalshi",
    description: "AI analysis, expert picks, copy trading & BTC signals for Polymarket and Kalshi. Start for $1.",
    url: "https://polygoat.io",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "PolyGoat",
  applicationCategory: "FinanceApplication",
  operatingSystem: "Web",
  description:
    "AI-powered prediction market trading tools for Polymarket and Kalshi. Includes AI market analyzer, daily picks, copy trading, and BTC price signals.",
  url: "https://polygoat.io",
  offers: {
    "@type": "Offer",
    price: "1.00",
    priceCurrency: "USD",
    description: "First month $1, then $39/month",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    reviewCount: "300",
    bestRating: "5",
  },
};

export default function LandingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="overflow-x-hidden">
        <Navbar />
        <Hero />
        <HowItWorks />
        <Features />
        <SocialProof />
        <Pricing />
        <Faq />

        {/* Final CTA */}
        <section className="py-28 px-4 text-center">
          <div className="max-w-xl mx-auto">
            <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 tracking-tight">
              Ready to get your{" "}
              <span className="text-gradient">edge?</span>
            </h2>
            <p className="text-white/45 text-sm mb-10">
              Trusted by over 300 traders. Start for $1. Cancel any time.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold hover:from-blue-500 hover:to-blue-400 transition-all shadow-md shadow-blue-950/40"
            >
              Start for $1
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}
