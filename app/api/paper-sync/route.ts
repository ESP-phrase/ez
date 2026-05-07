import { NextResponse } from "next/server";

import { fetchLiveMarkets, persistMarketSnapshots } from "@/lib/market-data";

export async function POST() {
  try {
    const feed = await fetchLiveMarkets(20);
    const persisted = await persistMarketSnapshots(feed);
    return NextResponse.json({
      synced: persisted.length,
      at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Paper sync failed:", error);
    return NextResponse.json({ error: "Failed to sync market data." }, { status: 500 });
  }
}
