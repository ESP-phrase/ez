import { promises as fs } from "node:fs";
import path from "node:path";

import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { analyzeMarketScreenshot } from "@/lib/openai";
import { ensureUser } from "@/lib/users";

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const ACCEPTED_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const email = String(formData.get("email") ?? "").trim();
    const name = String(formData.get("name") ?? "").trim();
    const image = formData.get("image");

    if (!email || !image || !(image instanceof File)) {
      return NextResponse.json(
        { error: "email and image are required." },
        { status: 400 }
      );
    }

    if (!ACCEPTED_TYPES.has(image.type)) {
      return NextResponse.json(
        { error: "Image must be PNG, JPEG, or WEBP." },
        { status: 400 }
      );
    }
    if (image.size > MAX_IMAGE_BYTES) {
      return NextResponse.json(
        { error: "Image must be 4MB or less." },
        { status: 400 }
      );
    }

    const user = await ensureUser(email, name);
    const bytes = Buffer.from(await image.arrayBuffer());

    const uploadsDir = path.join(process.cwd(), "public", "uploads", "analyzer");
    await fs.mkdir(uploadsDir, { recursive: true });
    const safeFile = `${Date.now()}-${image.name.replace(/\s+/g, "-")}`;
    const filePath = path.join(uploadsDir, safeFile);
    await fs.writeFile(filePath, bytes);

    const result = await analyzeMarketScreenshot({
      imageBuffer: bytes,
      mimeType: image.type,
      originalFileName: image.name,
    });

    const run = await db.analyzerRun.create({
      data: {
        userId: user.id,
        imagePath: `/uploads/analyzer/${safeFile}`,
        marketQuestion: result.marketQuestion,
        platform: result.platform,
        recommendation: result.recommendation,
        confidence: result.confidence,
        riskSummary: result.riskSummary,
        exitPlan: result.exitPlan,
        edge: result.edge,
        rawModelJson: JSON.stringify(result),
      },
    });

    return NextResponse.json({ run, result });
  } catch (error) {
    console.error("Analyzer route failed:", error);
    return NextResponse.json(
      { error: "Analyzer failed. Check API key or image quality and retry." },
      { status: 500 }
    );
  }
}
