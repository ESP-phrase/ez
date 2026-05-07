/**
 * Reddit Conversions API v3 (server-side)
 * Endpoint: https://ads-api.reddit.com/api/v3/pixels/{pixel_id}/conversion_events
 */

const REDDIT_PIXEL_ID = "a2_iyvdtsc4pdrn";
const REDDIT_CAPI_URL = `https://ads-api.reddit.com/api/v3/pixels/${REDDIT_PIXEL_ID}/conversion_events`;

interface RedditConversionEvent {
  trackingType: "Purchase" | "Lead" | "SignUp" | "PageVisit" | "Custom";
  actionSource?: "website" | "app" | "offline";
  email?: string;
  externalId?: string;
  ipAddress?: string;
  userAgent?: string;
  value?: number;   // in cents (e.g. 100 = $1.00)
  currency?: string;
}

export async function trackRedditConversion(event: RedditConversionEvent) {
  const accessToken = process.env.REDDIT_ADS_ACCESS_TOKEN;
  if (!accessToken) {
    console.warn("REDDIT_ADS_ACCESS_TOKEN not set — skipping Reddit CAPI");
    return;
  }

  const payload = {
    data: {
      events: [
        {
          event_at: Date.now(),
          action_source: event.actionSource ?? "website",
          type: {
            tracking_type: event.trackingType,
          },
          ...(event.value !== undefined ? {
            value: event.value,
            currency: event.currency ?? "USD",
          } : {}),
          user: {
            ...(event.email
              ? { email: await hashSHA256(event.email) }
              : {}),
            ...(event.externalId
              ? { external_id: await hashSHA256(event.externalId) }
              : {}),
            ...(event.ipAddress ? { ip_address: event.ipAddress } : {}),
            ...(event.userAgent ? { user_agent: event.userAgent } : {}),
          },
        },
      ],
    },
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
      console.log("Reddit CAPI: Purchase tracked ✓");
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
