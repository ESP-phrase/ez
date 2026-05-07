import { CopySignalSide } from "@prisma/client";

import { db } from "@/lib/db";

interface PolymarketActivityItem {
  id: string;
  marketId: string;
  marketTitle: string;
  side: CopySignalSide;
  odds: number;
  stake: number;
  timestamp: Date;
}

type PolymarketTrade = {
  conditionId?: string;
  type?: string;
  usdcSize?: number;
  size?: number;
  price?: number;
  outcome?: string;
  title?: string;
  name?: string;
  transactionHash?: string;
  timestamp?: number | string;
};

function toNumber(input: unknown, fallback = 0.5) {
  const value = Number(input);
  if (Number.isNaN(value)) return fallback;
  return value;
}

async function fetchPolymarketActivity(walletAddress: string): Promise<PolymarketActivityItem[]> {
  const query = new URLSearchParams({
    user: walletAddress,
    type: "TRADE",
    limit: "20",
    sortBy: "TIMESTAMP",
    sortDirection: "DESC",
  });
  const url = `https://data-api.polymarket.com/activity?${query.toString()}`;
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to fetch Polymarket activity (${response.status}).`);
  }
  const trades = (await response.json()) as PolymarketTrade[];
  if (!Array.isArray(trades)) return [];

  return trades
    .filter((trade) => trade.type === "TRADE" && trade.conditionId)
    .map((trade) => {
      const odds = Math.max(0.01, Math.min(0.99, toNumber(trade.price, 0.5)));
      const outcome = String(trade.outcome ?? "").toLowerCase();
      const side = outcome === "yes" ? CopySignalSide.YES : CopySignalSide.NO;
      const stake = toNumber(trade.usdcSize ?? trade.size, 10);
      const ts = trade.timestamp ? new Date(Number(trade.timestamp) * 1000) : new Date();
      const txId = trade.transactionHash ?? trade.conditionId ?? String(trade.timestamp ?? "");
      return {
        id: `${walletAddress}-${txId}`,
        marketId: String(trade.conditionId),
        marketTitle: String(trade.title ?? trade.name ?? "Unknown market"),
        side,
        odds,
        stake,
        timestamp: ts,
      };
    });
}

export async function ingestWalletSignals(sourceWalletId: string) {
  const sourceWallet = await db.copySourceWallet.findUnique({
    where: { id: sourceWalletId },
  });
  if (!sourceWallet) {
    throw new Error("Source wallet not found.");
  }

  const activity = await fetchPolymarketActivity(sourceWallet.walletAddress);
  const createdSignals = [];

  for (const item of activity) {
    const market = await db.market.upsert({
      where: {
        platform_externalMarketId: {
          platform: "Polymarket",
          externalMarketId: item.marketId,
        },
      },
      create: {
        platform: "Polymarket",
        externalMarketId: item.marketId,
        title: item.marketTitle,
        outcomeA: "Yes",
        outcomeB: "No",
      },
      update: {
        title: item.marketTitle,
      },
    });

    // Create a snapshot from the trade's own price so execute-copy can read current odds.
    const yesOdds = item.side === CopySignalSide.YES ? item.odds : 1 - item.odds;
    await db.marketSnapshot.create({
      data: {
        marketId: market.id,
        outcomeAOdds: yesOdds,
        outcomeBOdds: 1 - yesOdds,
      },
    });

    const existing = await db.copySignal.findUnique({
      where: { externalSignalId: item.id },
    });
    if (existing) continue;

    const signal = await db.copySignal.create({
      data: {
        sourceWalletId,
        externalSignalId: item.id,
        marketId: market.id,
        side: item.side,
        odds: item.odds,
        stake: item.stake,
        timestamp: item.timestamp,
      },
    });
    createdSignals.push(signal);
  }

  return createdSignals;
}
