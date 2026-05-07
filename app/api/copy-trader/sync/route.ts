import { NextResponse } from "next/server";
import { z } from "zod";

import { processPendingSignalsForUser } from "@/lib/copy-trader/execute-copy";
import { ingestWalletSignals } from "@/lib/copy-trader/polymarket-ingest";
import { db } from "@/lib/db";
import { ensureUser } from "@/lib/users";

const syncSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const payload = syncSchema.parse(await request.json());
    const user = await ensureUser(payload.email, payload.name);

    const subscriptions = await db.copySubscription.findMany({
      where: { userId: user.id, isActive: true },
      select: { sourceWalletId: true },
      distinct: ["sourceWalletId"],
    });

    let ingestedSignals = 0;
    for (const subscription of subscriptions) {
      const signals = await ingestWalletSignals(subscription.sourceWalletId);
      ingestedSignals += signals.length;
    }

    const executions = await processPendingSignalsForUser(user.id);

    return NextResponse.json({
      ingestedSignals,
      processedExecutions: executions.length,
      syncedAt: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Sync failed." },
      { status: 400 }
    );
  }
}
