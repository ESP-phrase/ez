import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { ensureUser } from "@/lib/users";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");
  const name = searchParams.get("name") ?? undefined;

  if (!email) {
    return NextResponse.json({ error: "email is required." }, { status: 400 });
  }

  const user = await ensureUser(email, name);
  const [executions, setting] = await Promise.all([
    db.copyExecution.findMany({
      where: { userId: user.id },
      include: {
        signal: {
          include: {
            market: true,
            sourceWallet: true,
          },
        },
        subscription: true,
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    db.copySetting.upsert({
      where: { userId: user.id },
      create: { userId: user.id },
      update: {},
    }),
  ]);

  // PnL requires knowing final market outcomes, which we don't track yet.
  const realizedPnl = 0;

  return NextResponse.json({
    setting,
    summary: {
      totalExecutions: executions.length,
      submitted: executions.filter((execution) => execution.status === "SUBMITTED").length,
      failed: executions.filter((execution) => execution.status === "FAILED").length,
      skipped: executions.filter((execution) => execution.status === "SKIPPED").length,
      realizedPnl: Number(realizedPnl.toFixed(2)),
    },
    executions,
  });
}
