// src/app/api/auth/reset/route.ts
import { PrismaClient } from "@prisma/client";
import { rateLimit, withRateLimitHeaders } from "@/lib/rate-limit";
import { hashPassword } from "@/lib/auth";

export const runtime = "nodejs";
const prisma = new PrismaClient();

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export async function POST(req: Request) {
  const rlMeta = rateLimit(req.headers);
  if (!rlMeta.ok) {
    return withRateLimitHeaders(jsonResponse({ error: "Zu viele Anfragen" }, 429), rlMeta);
  }

  const body = await req.json().catch(() => ({} as any));
  const token = (body?.token || "").toString();
  const password = (body?.password || "").toString();

  if (!token || !password || password.length < 8) {
    return withRateLimitHeaders(jsonResponse({ error: "Ungültige Eingabe" }, 400), rlMeta);
  }

  try {
    const authToken = await prisma.authToken.findUnique({ where: { token } });
    if (!authToken || authToken.type !== "RESET" || new Date(authToken.expiresAt) < new Date()) {
      return withRateLimitHeaders(jsonResponse({ error: "Ungültiger oder abgelaufener Token" }, 400), rlMeta);
    }

    const passwordHash = await hashPassword(password);
    await prisma.user.update({ where: { id: authToken.userId }, data: { passwordHash } });

    // Remove all reset tokens for this user
    await prisma.authToken.deleteMany({ where: { userId: authToken.userId, type: "RESET" } });

    // Optionally: invalidate sessions (security)
    await prisma.session.deleteMany({ where: { userId: authToken.userId } });

    return withRateLimitHeaders(jsonResponse({ ok: true }), rlMeta);
  } catch (err: any) {
    console.error("reset error:", err);
    return withRateLimitHeaders(jsonResponse({ error: "Serverfehler" }, 500), rlMeta);
  }
}
