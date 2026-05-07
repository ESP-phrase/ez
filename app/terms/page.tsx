import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "PolyGoat Terms of Service — read our terms before using the platform.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#040a14] text-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link href="/" className="inline-flex items-center gap-2 text-white/40 hover:text-white/70 text-sm mb-10 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to home
        </Link>

        <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight">Terms of Service</h1>
        <p className="text-white/30 text-sm mb-12">Last updated: May 7, 2026</p>

        <div className="prose prose-invert prose-sm max-w-none space-y-8 text-white/70 leading-relaxed">

          <section>
            <h2 className="text-lg font-bold text-white mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing or using PolyGoat (&ldquo;Service&rdquo;, &ldquo;Platform&rdquo;), operated by PolyGoat (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;),
              you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">2. Description of Service</h2>
            <p>
              PolyGoat provides AI-powered analysis tools, market signals, and educational resources for prediction market
              platforms including Polymarket and Kalshi. We provide informational tools only — we are not a licensed financial
              advisor, broker, or investment service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">3. No Financial Advice</h2>
            <p>
              All content, signals, picks, and analysis provided by PolyGoat are for informational and educational purposes only.
              Nothing on this platform constitutes financial advice, investment advice, or a recommendation to buy or sell any
              asset. You are solely responsible for your own trading decisions and any resulting profits or losses.
            </p>
            <p className="mt-3">
              Prediction market trading involves significant risk. Never trade more than you can afford to lose.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">4. Eligibility</h2>
            <p>
              You must be at least 18 years of age to use this Service. By using PolyGoat, you represent and warrant that you
              meet this requirement and that your use of the Service complies with all applicable laws in your jurisdiction.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">5. User Accounts</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account and for all activities that occur under your
              account. You agree to notify us immediately of any unauthorized use. We reserve the right to terminate accounts at
              our discretion.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">6. Subscriptions and Billing</h2>
            <p>
              PolyGoat offers paid subscription plans. By subscribing, you authorize us to charge your payment method on a
              recurring basis. Introductory pricing (e.g., first month for $1) applies only to new subscribers. Subscriptions
              automatically renew at the then-current rate unless cancelled before the renewal date.
            </p>
            <p className="mt-3">
              You may cancel your subscription at any time through your account settings. Cancellation takes effect at the end of
              the current billing period — no refunds are issued for partial periods.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">7. Prohibited Uses</h2>
            <p>You agree not to:</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Use the Service for any unlawful purpose</li>
              <li>Attempt to reverse-engineer, scrape, or copy our AI models or data</li>
              <li>Share your account credentials with others</li>
              <li>Use the Service to distribute spam or unsolicited communications</li>
              <li>Circumvent any access controls or security measures</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">8. Intellectual Property</h2>
            <p>
              All content, models, designs, and software on PolyGoat are owned by us or our licensors. You are granted a limited,
              non-exclusive, non-transferable license to use the Service for your personal, non-commercial purposes.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">9. Disclaimer of Warranties</h2>
            <p>
              THE SERVICE IS PROVIDED &ldquo;AS IS&rdquo; WITHOUT WARRANTY OF ANY KIND. WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED,
              INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND
              NON-INFRINGEMENT. WE DO NOT GUARANTEE ACCURACY, COMPLETENESS, OR PROFITABILITY OF ANY SIGNALS OR ANALYSIS.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">10. Limitation of Liability</h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, POLYGOAT SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL,
              CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING TRADING LOSSES, LOST PROFITS, OR LOSS OF DATA ARISING FROM YOUR
              USE OF THE SERVICE.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">11. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. We will provide notice of material changes via email or
              through the Service. Your continued use after changes take effect constitutes acceptance of the new Terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">12. Contact</h2>
            <p>
              If you have questions about these Terms, please contact us at{" "}
              <a href="mailto:support@polygoat.io" className="text-blue-400 hover:text-blue-300 transition-colors">
                support@polygoat.io
              </a>.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
