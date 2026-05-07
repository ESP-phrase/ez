import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { PostHogProvider } from "@/components/posthog-provider";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://polygoat.io"),
  title: {
    default: "PolyGoat — AI Trading Tools for Polymarket & Kalshi",
    template: "%s | PolyGoat",
  },
  description:
    "PolyGoat gives prediction market traders an unfair edge. AI market analysis, expert daily picks, copy trading, and real-time BTC signals — all in one platform. Start for $1.",
  keywords: [
    "polymarket",
    "kalshi",
    "prediction markets",
    "prediction market AI",
    "polymarket tools",
    "kalshi trading",
    "copy trading polymarket",
    "prediction market analysis",
    "polymarket picks",
    "polymarket edge",
    "AI trading signals",
    "BTC prediction market",
  ],
  authors: [{ name: "PolyGoat" }],
  creator: "PolyGoat",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://polygoat.io",
    siteName: "PolyGoat",
    title: "PolyGoat — AI Trading Tools for Polymarket & Kalshi",
    description:
      "Get an unfair edge on prediction markets. AI analysis, expert picks, copy trading, and live BTC signals. Trusted by 300+ traders. Start for $1.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "PolyGoat — AI-powered prediction market tools",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PolyGoat — AI Trading Tools for Polymarket & Kalshi",
    description:
      "Get an unfair edge on prediction markets. AI analysis, expert picks, copy trading, and live BTC signals. Start for $1.",
    images: ["/og-image.png"],
    creator: "@polygoat",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://polygoat.io",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen antialiased">
        <PostHogProvider>{children}</PostHogProvider>

        {/* Reddit Pixel */}
        <Script id="reddit-pixel" strategy="afterInteractive">
          {`
            !function(w,d){if(!w.rdt){var p=w.rdt=function(){p.sendEvent?p.sendEvent.apply(p,arguments):p.callQueue.push(arguments)};p.callQueue=[];var t=d.createElement("script");t.src="https://www.redditstatic.com/ads/pixel.js?pixel_id=a2_iyvdtsc4pdrn",t.async=!0;var s=d.getElementsByTagName("script")[0];s.parentNode.insertBefore(t,s)}}(window,document);
            rdt('init','a2_iyvdtsc4pdrn');
            rdt('track', 'PageVisit');
          `}
        </Script>

        {/* TikTok Pixel */}
        <Script id="tiktok-pixel" strategy="afterInteractive">
          {`
            !function (w, d, t) {
              w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script");n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};
              ttq.load('D7UF72JC77U471PH8RCG');
              ttq.page();
            }(window, document, 'ttq');
          `}
        </Script>
      </body>
    </html>
  );
}
