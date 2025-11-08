// src/app/api/auth/verify-email/route.ts
import { PrismaClient } from "@prisma/client";
import { rateLimit, withRateLimitHeaders } from "@/lib/rate-limit";

export const runtime = "nodejs";
const prisma = new PrismaClient();

export async function GET(req: Request) {
  const rlMeta = rateLimit(req.headers);
  if (!rlMeta.ok) {
    return withRateLimitHeaders(new Response(JSON.stringify({ error: "Zu viele Anfragen" }), { status: 429, headers: { "content-type": "application/json" } }), rlMeta);
  }

  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token") || "";

    if (!token) {
      return withRateLimitHeaders(new Response(JSON.stringify({ error: "Fehlender Token" }), { status: 400, headers: { "content-type": "application/json" } }), rlMeta);
    }

    const authToken = await prisma.authToken.findUnique({ where: { token } });
    if (!authToken || authToken.type !== "VERIFY" || new Date(authToken.expiresAt) < new Date()) {
      return withRateLimitHeaders(new Response(JSON.stringify({ error: "Ungültiger oder abgelaufener Token" }), { status: 400, headers: { "content-type": "application/json" } }), rlMeta);
    }

    await prisma.user.update({ where: { id: authToken.userId }, data: { emailVerifiedAt: new Date() } });

    // remove all verify tokens for the user
    await prisma.authToken.deleteMany({ where: { userId: authToken.userId, type: "VERIFY" } });

    return withRateLimitHeaders(new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "content-type": "application/json" } }), rlMeta);
  } catch (err: any) {
    console.error("verify-email error:", err);
    return withRateLimitHeaders(new Response(JSON.stringify({ error: "Serverfehler" }), { status: 500, headers: { "content-type": "application/json" } }), rlMeta);
  }
}
