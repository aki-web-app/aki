// src/app/api/auth/login/route.ts
import { PrismaClient } from "@prisma/client";
import { rateLimit, withRateLimitHeaders } from "@/lib/rate-limit";
import { verifyPassword, createSession } from "@/lib/auth";

export const runtime = "nodejs";
const prisma = new PrismaClient();

function buildCookie(token: string) {
  const name = process.env.AUTH_COOKIE_NAME || "aki.session";
  const days = Number(process.env.AUTH_COOKIE_MAX_AGE_DAYS || 7);
  const maxAge = days * 24 * 60 * 60;
  const secure = process.env.AUTH_COOKIE_SECURE === "true";
  const sameSite = process.env.AUTH_COOKIE_SAME_SITE || "strict";
  return `${name}=${token}; Path=/; HttpOnly; Max-Age=${maxAge}; SameSite=${sameSite}${secure ? "; Secure" : ""}`;
}

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
  const email = (body?.email || "").toString().trim().toLowerCase();
  const password = (body?.password || "").toString();

  if (!email || !password) {
    return withRateLimitHeaders(jsonResponse({ error: "Ungültige Eingabe" }, 400), rlMeta);
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      // Generic error to not leak user existence
      return withRateLimitHeaders(jsonResponse({ error: "E-Mail oder Passwort falsch" }, 400), rlMeta);
    }

    const valid = await verifyPassword(user.passwordHash, password);
    if (!valid) {
      return withRateLimitHeaders(jsonResponse({ error: "E-Mail oder Passwort falsch" }, 400), rlMeta);
    }

    const session = await createSession(user.id);
    const setCookie = buildCookie(session.token);

    const resp = new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "content-type": "application/json", "Set-Cookie": setCookie },
    });

    return withRateLimitHeaders(resp, rlMeta);
  } catch (err: any) {
    console.error("login error:", err);
    return withRateLimitHeaders(jsonResponse({ error: "Serverfehler" }, 500), rlMeta);
  }
}
