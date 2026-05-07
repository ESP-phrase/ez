/**
 * Reddit Conversions API (server-side)
 * Docs: https://ads.reddit.com/docs/conversions
 */

const REDDIT_PIXEL_ID = "a2_iyvdtsc4pdrn";
const REDDIT_CAPI_URL = `https://ads-api.reddit.com/api/v2.0/conversions/events/${REDDIT_PIXEL_ID}`;

interface RedditConversionEvent {
  trackingType: "Purchase" | "Lead" | "SignUp" | "PageVisit" | "Custom";
  email?: string;
  externalId?: string;
  ipAddress?: string;
  userAgent?: string;
  value?: number;   // in cents (e.g. 100 = $1.00)
  currency?: string;
  conversionId?: string; // unique per event to deduplicate with pixel
  testId?: string;  // only for testing — remove before production
}

export async function trackRedditConversion(event: RedditConversionEvent) {
  const accessToken = process.env.REDDIT_ADS_ACCESS_TOKEN;
  if (!accessToken) {
    console.warn("REDDIT_ADS_ACCESS_TOKEN not set — skipping server-side conversion");
    return;
  }

  const payload = {
    ...(event.testId ? { test_mode: true, test_id: event.testId } : {}),
    events: [
      {
        event_at: new Date().toISOString(),
        event_type: {
          tracking_type: event.trackingType,
        },
        ...(event.conversionId ? { click_id: event.conversionId } : {}),
        value: event.value ?? 0,
        currency: event.currency ?? "USD",
        user: {
          ...(event.email ? { email: hashSHA256(event.email) } : {}),
          ...(event.externalId ? { external_id: hashSHA256(event.externalId) } : {}),
          ...(event.ipAddress ? { ip_address: event.ipAddress } : {}),
          ...(event.userAgent ? { user_agent: event.userAgent } : {}),
        },
      },
    ],
  };

  try {
    const res = await fetch(REDDIT_CAPI_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Reddit CAPI error:", res.status, text);
    } else {
      console.log("Reddit CAPI: conversion tracked successfully");
    }
  } catch (err) {
    console.error("Reddit CAPI fetch failed:", err);
  }
}

// SHA-256 hash for PII (required by Reddit CAPI)
async function hashSHA256(value: string): Promise<string> {
  const normalized = value.toLowerCase().trim();
  const encoder = new TextEncoder();
  const data = encoder.encode(normalized);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
