import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { email, name } = (await req.json()) as { email?: string; name?: string };
    if (!email || !name?.trim()) {
      return NextResponse.json({ error: "Email and name required." }, { status: 400 });
    }
    const user = await db.user.update({
      where: { email: email.toLowerCase().trim() },
      data: { name: name.trim() },
    });
    return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name } });
  } catch (err) {
    return NextResponse.json({ error: "Failed to update name." }, { status: 500 });
  }
}
