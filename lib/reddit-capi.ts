/**
 * Reddit Conversions API v3 (server-side)
 * Endpoint: https://ads-api.reddit.com/api/v3/pixels/{pixel_id}/conversion_events
 */

const REDDIT_PIXEL_ID = "a2_iyvdtsc4pdrn";
const REDDIT_CAPI_URL = `https://ads-api.reddit.com/api/v3/pixels/${REDDIT_PIXEL_ID}/conversion_events`;

interface RedditConversionEvent {
  trackingType: "Purchase" | "Lead" | "SignUp" | "PageVisit" | "Custom";
  actionSource?: "website" | "app" | "offline";
  // Match keys
  clickId?: string;        // rdt_cid from URL when user clicked Reddit ad
  email?: string;
  phoneNumber?: string;
  externalId?: string;     // your internal user ID
  ipAddress?: string;
  userAgent?: string;
  uuid?: string;           // Reddit UUID from rdt cookie
  idfa?: string;           // iOS ad ID
  aaid?: string;           // Android ad ID
  screenWidth?: number;
  screenHeight?: number;
  // Conversion
  conversionId?: string;   // invoice/order ID — used to deduplicate with client pixel
  value?: number;          // in cents
  currency?: string;
}

export async function trackRedditConversion(event: RedditConversionEvent) {
  const accessToken = process.env.REDDIT_ADS_ACCESS_TOKEN;
  if (!accessToken) {
    console.warn("REDDIT_ADS_ACCESS_TOKEN not set — skipping Reddit CAPI");
    return;
  }

  // Build user object — only include fields we have
  const user: Record<string, unknown> = {};
  if (event.email)       user.email        = await hashSHA256(event.email);
  if (event.phoneNumber) user.phone_number = await hashSHA256(event.phoneNumber);
  if (event.externalId)  user.external_id  = await hashSHA256(event.externalId);
  if (event.ipAddress)   user.ip_address   = event.ipAddress;
  if (event.userAgent)   user.user_agent   = event.userAgent;
  if (event.uuid)        user.uuid         = event.uuid;
  if (event.idfa)        user.idfa         = event.idfa;
  if (event.aaid)        user.aaid         = event.aaid;
  if (event.screenWidth && event.screenHeight) {
    user.screen_dimensions = {
      width: event.screenWidth,
      height: event.screenHeight,
    };
  }

  const eventPayload: Record<string, unknown> = {
    event_at:      Date.now(),
    action_source: event.actionSource ?? "website",
    type: {
      tracking_type: event.trackingType,
    },
    user,
  };

  if (event.clickId) {
    eventPayload.click_id = event.clickId;
  }

  if (event.value !== undefined) {
    eventPayload.value    = event.value;
    eventPayload.currency = event.currency ?? "USD";
  }

  if (event.conversionId) {
    eventPayload.metadata = {
      conversion_id: event.conversionId,
    };
  }

  const payload = {
    data: {
      events: [eventPayload],
    },
  };

  try {
    const res = await fetch(REDDIT_CAPI_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
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
