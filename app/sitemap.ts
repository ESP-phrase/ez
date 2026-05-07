import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://polygoat.io";
  return [
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${base}/login`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/dashboard`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/dashboard/btc-edge`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/dashboard/btc-edge/backtest`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
  ];
}
