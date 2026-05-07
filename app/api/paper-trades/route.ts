import { TradeSide } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { closePaperPosition, listPaperPositionsWithPnl, openPaperPosition } from "@/lib/paper-trading";
import { ensureUser } from "@/lib/users";

const createTradeSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  marketId: z.string().min(1),
  side: z.enum(["YES", "NO"]),
  stake: z.number().positive().max(100000),
});

const closeTradeSchema = z.object({
  positionId: z.string().min(1),
});

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const email = url.searchParams.get("email");
    const name = url.searchParams.get("name") ?? undefined;

    if (!email) {
      return NextResponse.json({ error: "email query param is required." }, { status: 400 });
    }

    const user = await ensureUser(email, name);
    const data = await listPaperPositionsWithPnl(user.id);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Paper GET failed:", error);
    return NextResponse.json({ error: "Failed to load paper trades." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = createTradeSchema.parse(await request.json());
    const user = await ensureUser(payload.email, payload.name);
    const opened = await openPaperPosition({
      userId: user.id,
      marketId: payload.marketId,
      side: payload.side as TradeSide,
      stake: payload.stake,
    });
    return NextResponse.json(opened, { status: 201 });
  } catch (error) {
    console.error("Paper POST failed:", error);
    return NextResponse.json(
      { error: "Failed to open paper trade." },
      { status: 400 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const payload = closeTradeSchema.parse(await request.json());
    const closed = await closePaperPosition({ positionId: payload.positionId });
    return NextResponse.json(closed);
  } catch (error) {
    console.error("Paper PATCH failed:", error);
    return NextResponse.json({ error: "Failed to close paper trade." }, { status: 400 });
  }
}
