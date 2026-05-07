import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { ensureUser } from "@/lib/users";

type PolymarketTrade = {
  proxyWallet?: string;
  timestamp?: number | string;
  conditionId?: string;
  type?: string;
  size?: number;
  usdcSize?: number;
  transactionHash?: string;
  price?: number;
  side?: "BUY" | "SELL" | string;
  outcome?: string;
  title?: string;
  slug?: string;
  eventSlug?: string;
  name?: string;
};

function resolvePolymarketUrl(trade: PolymarketTrade) {
  const slug = trade.eventSlug ?? trade.slug;
  if (slug) {
    return `https://polymarket.com/event/${encodeURIComponent(slug)}`;
  }
  const query = trade.title ?? trade.name ?? "";
  if (!query) {
    return "https://polymarket.com/";
  }
  return `https://polymarket.com/?q=${encodeURIComponent(query)}`;
}

function resolveTxHash(trade: PolymarketTrade) {
  const raw = trade.transactionHash;
  if (!raw) return null;
  const value = String(raw).trim();
  if (!value) return null;
  return value.startsWith("0x") ? value : `0x${value}`;
}

function resolveExplorerUrl(txHash: string) {
  return `https://polygonscan.com/tx/${txHash}`;
}

async function fetchWalletTrades(walletAddress: string): Promise<PolymarketTrade[]> {
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
    return [];
  }
  const trades = (await response.json()) as PolymarketTrade[];
  return Array.isArray(trades)
    ? trades.filter((item) => item.type === "TRADE")
    : [];
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const name = searchParams.get("name") ?? undefined;

    if (!email) {
      return NextResponse.json({ error: "email is required." }, { status: 400 });
    }

    const user = await ensureUser(email, name);
    const subscriptions = await db.copySubscription.findMany({
      where: { userId: user.id, isActive: true },
      include: { sourceWallet: true },
      take: 10,
    });

    const allTrades = await Promise.all(
      subscriptions.map(async (subscription) => {
        const trades = await fetchWalletTrades(subscription.sourceWallet.walletAddress);
        return trades.map((trade) => {
          const txHash = resolveTxHash(trade);
          return {
            walletAddress: subscription.sourceWallet.walletAddress,
            walletName: subscription.sourceWallet.displayName,
            id: `${trade.transactionHash ?? trade.conditionId ?? "trade"}-${String(trade.timestamp ?? "")}`,
            market: trade.title ?? trade.name ?? "Unknown market",
            side: trade.side ?? "N/A",
            price: Number(trade.price ?? 0),
            size: Number(trade.size ?? 0),
            timestamp: trade.timestamp ? new Date(Number(trade.timestamp) * 1000).toISOString() : "",
            polymarketUrl: resolvePolymarketUrl(trade),
            txHash,
            explorerUrl: txHash ? resolveExplorerUrl(txHash) : null,
          };
        });
      })
    );

    return NextResponse.json({
      trades: allTrades.flat().sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1)).slice(0, 30),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load recent trades." },
      { status: 500 }
    );
  }
}
