import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { ensureUser } from "@/lib/users";

const followSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  walletAddress: z.string().min(6),
});

const updateSchema = z.object({
  subscriptionId: z.string().min(1),
  isActive: z.boolean().optional(),
  autoCopyEnabled: z.boolean().optional(),
  maxStakePerTrade: z.number().positive().max(10000).optional(),
  maxSlippagePct: z.number().min(0).max(20).optional(),
  maxOpenExposure: z.number().positive().max(100000).optional(),
  sizeMultiplier: z.number().min(0.1).max(10).optional(),
  allowedMarkets: z.array(z.string()).optional(),
});

const deleteSchema = z.object({
  subscriptionId: z.string().min(1),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");
  const name = searchParams.get("name") ?? undefined;
  if (!email) {
    return NextResponse.json({ error: "email is required." }, { status: 400 });
  }
  const user = await ensureUser(email, name);
  const subscriptions = await db.copySubscription.findMany({
    where: { userId: user.id },
    include: { sourceWallet: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ subscriptions });
}

export async function POST(request: Request) {
  try {
    const payload = followSchema.parse(await request.json());
    const user = await ensureUser(payload.email, payload.name);
    const normalizedWallet = payload.walletAddress.toLowerCase();
    const autoDisplayName = `Wallet ${normalizedWallet.slice(0, 6)}...${normalizedWallet.slice(-4)}`;
    const sourceWallet = await db.copySourceWallet.upsert({
      where: { walletAddress: normalizedWallet },
      create: {
        walletAddress: normalizedWallet,
        displayName: autoDisplayName,
      },
      update: { displayName: autoDisplayName },
    });

    const subscription = await db.copySubscription.upsert({
      where: {
        userId_sourceWalletId: {
          userId: user.id,
          sourceWalletId: sourceWallet.id,
        },
      },
      create: {
        userId: user.id,
        sourceWalletId: sourceWallet.id,
        isActive: true,
        autoCopyEnabled: false,
      },
      update: {
        isActive: true,
      },
      include: { sourceWallet: true },
    });

    return NextResponse.json({ subscription }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid follow payload." },
      { status: 400 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const payload = updateSchema.parse(await request.json());
    const subscription = await db.copySubscription.update({
      where: { id: payload.subscriptionId },
      data: {
        isActive: payload.isActive,
        autoCopyEnabled: payload.autoCopyEnabled,
        maxStakePerTrade: payload.maxStakePerTrade,
        maxSlippagePct: payload.maxSlippagePct,
        maxOpenExposure: payload.maxOpenExposure,
        sizeMultiplier: payload.sizeMultiplier,
        allowedMarketsJson: payload.allowedMarkets ? JSON.stringify(payload.allowedMarkets) : undefined,
      },
      include: { sourceWallet: true },
    });
    return NextResponse.json({ subscription });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid update payload." },
      { status: 400 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const payload = deleteSchema.parse(await request.json());
    await db.copySubscription.delete({
      where: { id: payload.subscriptionId },
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid delete payload." },
      { status: 400 }
    );
  }
}
