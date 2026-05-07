import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

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
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
