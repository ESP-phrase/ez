import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "PolyGoat Privacy Policy — how we collect, use, and protect your data.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#040a14] text-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link href="/" className="inline-flex items-center gap-2 text-white/40 hover:text-white/70 text-sm mb-10 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to home
        </Link>

        <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight">Privacy Policy</h1>
        <p className="text-white/30 text-sm mb-12">Last updated: May 7, 2026</p>

        <div className="prose prose-invert prose-sm max-w-none space-y-8 text-white/70 leading-relaxed">

          <section>
            <h2 className="text-lg font-bold text-white mb-3">1. Introduction</h2>
            <p>
              PolyGoat (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) is committed to protecting your privacy. This Privacy Policy explains how we
              collect, use, disclose, and safeguard your information when you use our platform at polygoat.io.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">2. Information We Collect</h2>
            <p><strong className="text-white">Information you provide:</strong></p>
            <ul className="list-disc list-inside space-y-1 mt-2 mb-4">
              <li>Email address (used for account creation and login)</li>
              <li>Display name (optional, used to personalize your experience)</li>
              <li>Payment information (processed securely by Stripe — we never store card details)</li>
              <li>Market screenshots you upload for AI analysis</li>
            </ul>
            <p><strong className="text-white">Information collected automatically:</strong></p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Usage analytics (pages visited, features used) via PostHog</li>
              <li>Session recordings (inputs masked except non-sensitive fields)</li>
              <li>IP address and browser/device information</li>
              <li>Cookies and local storage for authentication state</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>To authenticate you and maintain your account</li>
              <li>To process subscription payments via Stripe</li>
              <li>To provide AI analysis on uploaded market screenshots</li>
              <li>To send transactional emails (login codes, billing receipts)</li>
              <li>To improve our product through anonymized usage analytics</li>
              <li>To detect and prevent fraud or abuse</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">4. Sharing Your Information</h2>
            <p>We do not sell your personal information. We share data only with:</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li><strong className="text-white">Stripe</strong> — payment processing</li>
              <li><strong className="text-white">Resend</strong> — transactional email delivery</li>
              <li><strong className="text-white">PostHog</strong> — product analytics (data is pseudonymized)</li>
              <li><strong className="text-white">OpenAI</strong> — AI analysis of uploaded market images (no PII included in prompts)</li>
              <li><strong className="text-white">Neon / PostgreSQL</strong> — secure cloud database hosting</li>
            </ul>
            <p className="mt-3">
              We may also disclose information if required by law or to protect the rights, property, or safety of PolyGoat or its users.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">5. Data Retention</h2>
            <p>
              We retain your account data for as long as your account is active. Uploaded market screenshots used for AI analysis
              are stored temporarily and not used to train AI models. OTP login codes expire within 10 minutes.
            </p>
            <p className="mt-3">
              You may request deletion of your account and associated data at any time by contacting us at{" "}
              <a href="mailto:support@polygoat.io" className="text-blue-400 hover:text-blue-300 transition-colors">
                support@polygoat.io
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">6. Cookies and Local Storage</h2>
            <p>
              We use browser local storage to maintain your authentication session. We use analytics cookies via PostHog to
              understand how users interact with our platform. You may opt out of analytics tracking by using an ad blocker or
              adjusting your browser settings, though this may affect functionality.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">7. Security</h2>
            <p>
              We implement industry-standard security measures including HTTPS encryption, hashed authentication tokens, and
              secure database connections. However, no method of transmission over the internet is 100% secure, and we cannot
              guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">8. Your Rights</h2>
            <p>Depending on your location, you may have rights to:</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Access the personal data we hold about you</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Object to or restrict processing of your data</li>
              <li>Data portability</li>
            </ul>
            <p className="mt-3">To exercise any of these rights, contact us at <a href="mailto:support@polygoat.io" className="text-blue-400 hover:text-blue-300 transition-colors">support@polygoat.io</a>.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">9. Children&apos;s Privacy</h2>
            <p>
              PolyGoat is not directed to individuals under 18 years of age. We do not knowingly collect personal information
              from children. If we become aware that a child has provided us with personal information, we will delete it.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">10. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of significant changes by email or via a
              notice on our platform. Your continued use of the Service after the changes take effect constitutes your acceptance
              of the revised policy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">11. Contact Us</h2>
            <p>
              If you have questions or concerns about this Privacy Policy, please contact us at{" "}
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
