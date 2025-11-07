import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export const runtime = "nodejs";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ ok: true, db: "up" });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, db: "down", error: e?.message ?? String(e) },
      { status: 500 }
    );
  }
}
