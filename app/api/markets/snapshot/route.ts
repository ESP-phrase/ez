import { NextResponse } from "next/server";

import { fetchLiveMarkets, persistMarketSnapshots } from "@/lib/market-data";

export async function GET() {
  try {
    const feed = await fetchLiveMarkets(20);
    const persisted = await persistMarketSnapshots(feed);

    return NextResponse.json({
      markets: persisted.map(({ market, snapshot }) => ({
        id: market.id,
        platform: market.platform,
        externalMarketId: market.externalMarketId,
        title: market.title,
        outcomeA: market.outcomeA,
        outcomeB: market.outcomeB,
        outcomeAOdds: snapshot.outcomeAOdds,
        outcomeBOdds: snapshot.outcomeBOdds,
        fetchedAt: snapshot.fetchedAt,
      })),
    });
  } catch (error) {
    console.error("Snapshot fetch failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch market snapshots." },
      { status: 500 }
    );
  }
}
