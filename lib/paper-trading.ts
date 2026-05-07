import { PositionStatus, TradeSide } from "@prisma/client";

import { db } from "@/lib/db";
import { getLatestSnapshotByMarketId } from "@/lib/market-data";

function roundCurrency(value: number) {
  return Number(value.toFixed(2));
}

function quantityFromStake(stake: number, entryOdds: number) {
  return stake / entryOdds;
}

function currentOddsForSide(side: TradeSide, aOdds: number, bOdds: number) {
  return side === TradeSide.YES ? aOdds : bOdds;
}

function unrealizedPnl(stake: number, quantity: number, markOdds: number) {
  return quantity * markOdds - stake;
}

export async function openPaperPosition(params: {
  userId: string;
  marketId: string;
  side: TradeSide;
  stake: number;
}) {
  const latest = await getLatestSnapshotByMarketId(params.marketId);
  if (!latest) {
    throw new Error("No market snapshot available for this market.");
  }

  const entryOdds = currentOddsForSide(params.side, latest.outcomeAOdds, latest.outcomeBOdds);
  const quantity = quantityFromStake(params.stake, entryOdds);

  const position = await db.paperPosition.create({
    data: {
      userId: params.userId,
      marketId: params.marketId,
      side: params.side,
      stake: params.stake,
      entryOdds,
      quantity,
      status: PositionStatus.OPEN,
      events: {
        create: {
          eventType: "OPEN",
          odds: entryOdds,
          stakeDelta: params.stake,
        },
      },
    },
  });

  return { position, entryOdds, quantity };
}

export async function closePaperPosition(params: { positionId: string }) {
  const position = await db.paperPosition.findUnique({
    where: { id: params.positionId },
  });

  if (!position) {
    throw new Error("Position not found.");
  }
  if (position.status === PositionStatus.CLOSED) {
    throw new Error("Position already closed.");
  }

  const latest = await getLatestSnapshotByMarketId(position.marketId);
  if (!latest) {
    throw new Error("No market snapshot available.");
  }

  const markOdds = currentOddsForSide(position.side, latest.outcomeAOdds, latest.outcomeBOdds);
  const realizedPnl = unrealizedPnl(position.stake, position.quantity, markOdds);

  const updated = await db.paperPosition.update({
    where: { id: position.id },
    data: {
      status: PositionStatus.CLOSED,
      closedAt: new Date(),
      events: {
        create: {
          eventType: "CLOSE",
          odds: markOdds,
          stakeDelta: 0,
        },
      },
    },
  });

  return { position: updated, markOdds, realizedPnl: roundCurrency(realizedPnl) };
}

export async function listPaperPositionsWithPnl(userId: string) {
  const positions = await db.paperPosition.findMany({
    where: { userId },
    include: {
      market: true,
    },
    orderBy: { openedAt: "desc" },
  });

  const enriched = await Promise.all(
    positions.map(async (position) => {
      const latest = await getLatestSnapshotByMarketId(position.marketId);
      const markOdds = latest
        ? currentOddsForSide(position.side, latest.outcomeAOdds, latest.outcomeBOdds)
        : position.entryOdds;
      const pnl = unrealizedPnl(position.stake, position.quantity, markOdds);

      return {
        ...position,
        markOdds,
        pnl: roundCurrency(pnl),
      };
    })
  );

  const openPnl = enriched
    .filter((p) => p.status === PositionStatus.OPEN)
    .reduce((sum, p) => sum + p.pnl, 0);
  const realizedPnl = enriched
    .filter((p) => p.status === PositionStatus.CLOSED)
    .reduce((sum, p) => sum + p.pnl, 0);

  return {
    positions: enriched,
    summary: {
      totalPositions: enriched.length,
      openPositions: enriched.filter((p) => p.status === PositionStatus.OPEN).length,
      closedPositions: enriched.filter((p) => p.status === PositionStatus.CLOSED).length,
      openPnl: roundCurrency(openPnl),
      realizedPnl: roundCurrency(realizedPnl),
    },
  };
}
