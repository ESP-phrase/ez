import crypto from "node:crypto";

import { CopyExecutionStatus } from "@prisma/client";

import { db } from "@/lib/db";
import { evaluateRiskRules } from "@/lib/copy-trader/risk-rules";

async function getLatestMarketOdds(marketId: string) {
  return db.marketSnapshot.findFirst({
    where: { marketId },
    orderBy: { fetchedAt: "desc" },
  });
}

async function maybeTriggerCircuitBreaker(userId: string) {
  const [setting, failedCount] = await Promise.all([
    db.copySetting.findUnique({ where: { userId } }),
    db.copyExecution.count({
      where: {
        userId,
        status: CopyExecutionStatus.FAILED,
        createdAt: { gte: new Date(Date.now() - 1000 * 60 * 60 * 24) },
      },
    }),
  ]);

  if (!setting) return;
  if (failedCount < setting.maxFailedExecs) return;

  await db.copySetting.update({
    where: { userId },
    data: { killSwitchEnabled: true },
  });
}

export async function processSignalForSubscription(params: {
  userId: string;
  subscriptionId: string;
  signalId: string;
}) {
  const signal = await db.copySignal.findUnique({
    where: { id: params.signalId },
  });
  if (!signal) {
    throw new Error("Signal not found.");
  }

  const risk = await evaluateRiskRules({
    userId: params.userId,
    subscriptionId: params.subscriptionId,
    requestedStake: signal.stake,
    marketId: signal.marketId,
  });

  if (!risk.allowed) {
    return db.copyExecution.create({
      data: {
        userId: params.userId,
        subscriptionId: params.subscriptionId,
        signalId: signal.id,
        status: CopyExecutionStatus.SKIPPED,
        mirroredStake: 0,
        slippagePct: 0,
        idempotencyKey: crypto.randomUUID(),
        errorMessage: risk.reason,
      },
    });
  }

  const subscription = await db.copySubscription.findUnique({
    where: { id: params.subscriptionId },
  });
  if (!subscription) {
    throw new Error("Subscription not found.");
  }

  const idempotencyKey = `${params.subscriptionId}:${signal.externalSignalId}`;
  const existing = await db.copyExecution.findUnique({ where: { idempotencyKey } });
  if (existing) {
    return existing;
  }

  const queued = await db.copyExecution.create({
    data: {
      userId: params.userId,
      subscriptionId: params.subscriptionId,
      signalId: signal.id,
      status: CopyExecutionStatus.QUEUED,
      mirroredStake: risk.mirroredStake,
      slippagePct: subscription.maxSlippagePct,
      idempotencyKey,
    },
  });

  try {
    const snapshot = await getLatestMarketOdds(signal.marketId);
    const currentOdds = snapshot
      ? signal.side === "YES"
        ? snapshot.outcomeAOdds
        : snapshot.outcomeBOdds
      : signal.odds;

    const slippagePct = Math.abs(currentOdds - signal.odds) / signal.odds * 100;
    const slippageOk = slippagePct <= subscription.maxSlippagePct;

    // Placeholder: real Polymarket CLOB order submission would go here.
    const externalOrderId = `poly-${crypto.randomUUID()}`;
    const status = slippageOk ? CopyExecutionStatus.SUBMITTED : CopyExecutionStatus.FAILED;

    const updated = await db.copyExecution.update({
      where: { id: queued.id },
      data: {
        status,
        externalOrderId,
        errorMessage: slippageOk ? null : `Slippage too high: ${slippagePct.toFixed(1)}%`,
      },
    });
    return updated;
  } catch (error) {
    const failed = await db.copyExecution.update({
      where: { id: queued.id },
      data: {
        status: CopyExecutionStatus.FAILED,
        errorMessage: error instanceof Error ? error.message : "Execution failed.",
      },
    });
    await maybeTriggerCircuitBreaker(params.userId);
    return failed;
  }
}

export async function processPendingSignalsForUser(userId: string) {
  const subscriptions = await db.copySubscription.findMany({
    where: { userId, isActive: true, autoCopyEnabled: true },
    include: { sourceWallet: true },
  });

  const results = [];
  for (const subscription of subscriptions) {
    const signals = await db.copySignal.findMany({
      where: { sourceWalletId: subscription.sourceWalletId },
      orderBy: { timestamp: "desc" },
      take: 5,
    });

    for (const signal of signals) {
      const execution = await processSignalForSubscription({
        userId,
        subscriptionId: subscription.id,
        signalId: signal.id,
      });
      results.push(execution);
    }
  }

  return results;
}
