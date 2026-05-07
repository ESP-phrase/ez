import { db } from "@/lib/db";

export interface RiskDecision {
  allowed: boolean;
  reason?: string;
  mirroredStake: number;
}

export async function evaluateRiskRules(params: {
  userId: string;
  subscriptionId: string;
  requestedStake: number;
  marketId: string;
}): Promise<RiskDecision> {
  const dayAgo = new Date(Date.now() - 1000 * 60 * 60 * 24);

  const [subscription, setting, openExecutions, todayAggregate] = await Promise.all([
    db.copySubscription.findUnique({
      where: { id: params.subscriptionId },
    }),
    db.copySetting.findUnique({
      where: { userId: params.userId },
    }),
    db.copyExecution.findMany({
      where: {
        userId: params.userId,
        status: { in: ["QUEUED", "SUBMITTED", "FILLED"] },
      },
    }),
    db.copyExecution.aggregate({
      where: {
        userId: params.userId,
        status: { in: ["SUBMITTED", "FILLED"] },
        createdAt: { gte: dayAgo },
      },
      _sum: { mirroredStake: true },
    }),
  ]);

  if (!subscription || !subscription.isActive || !subscription.autoCopyEnabled) {
    return { allowed: false, reason: "Subscription is not active for auto-copy.", mirroredStake: 0 };
  }

  if (setting?.killSwitchEnabled) {
    return { allowed: false, reason: "Kill switch is enabled.", mirroredStake: 0 };
  }

  const allowedMarkets = subscription.allowedMarketsJson
    ? (JSON.parse(subscription.allowedMarketsJson) as string[])
    : [];
  if (allowedMarkets.length > 0 && !allowedMarkets.includes(params.marketId)) {
    return { allowed: false, reason: "Market is not in allowlist.", mirroredStake: 0 };
  }

  const mirroredStake = Math.min(
    subscription.maxStakePerTrade,
    Number((params.requestedStake * subscription.sizeMultiplier).toFixed(2))
  );

  if (setting?.dailyLossLimit) {
    const spentToday = todayAggregate._sum.mirroredStake ?? 0;
    if (spentToday + mirroredStake > setting.dailyLossLimit) {
      return { allowed: false, reason: "Daily loss limit reached.", mirroredStake: 0 };
    }
  }

  const currentExposure = openExecutions.reduce((sum, execution) => sum + execution.mirroredStake, 0);
  if (currentExposure + mirroredStake > subscription.maxOpenExposure) {
    return { allowed: false, reason: "Max open exposure exceeded.", mirroredStake: 0 };
  }

  return { allowed: true, mirroredStake };
}
