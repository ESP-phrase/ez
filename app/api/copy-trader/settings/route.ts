import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { ensureUser } from "@/lib/users";

const settingsSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  killSwitchEnabled: z.boolean().optional(),
  dailyLossLimit: z.number().positive().max(100000).optional(),
  maxFailedExecs: z.number().int().min(1).max(50).optional(),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");
  const name = searchParams.get("name") ?? undefined;
  if (!email) {
    return NextResponse.json({ error: "email is required." }, { status: 400 });
  }
  const user = await ensureUser(email, name);
  const setting = await db.copySetting.upsert({
    where: { userId: user.id },
    create: { userId: user.id },
    update: {},
  });
  return NextResponse.json({ setting });
}

export async function PATCH(request: Request) {
  try {
    const payload = settingsSchema.parse(await request.json());
    const user = await ensureUser(payload.email, payload.name);
    const setting = await db.copySetting.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        killSwitchEnabled: payload.killSwitchEnabled ?? false,
        dailyLossLimit: payload.dailyLossLimit ?? 200,
        maxFailedExecs: payload.maxFailedExecs ?? 5,
      },
      update: {
        killSwitchEnabled: payload.killSwitchEnabled,
        dailyLossLimit: payload.dailyLossLimit,
        maxFailedExecs: payload.maxFailedExecs,
      },
    });
    return NextResponse.json({ setting });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid settings payload." },
      { status: 400 }
    );
  }
}
