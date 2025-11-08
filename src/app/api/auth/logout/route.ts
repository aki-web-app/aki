// src/app/api/auth/logout/route.ts
import { PrismaClient } from "@prisma/client";
import { rateLimit, withRateLimitHeaders } from "@/lib/rate-limit";

export const runtime = "nodejs";
const prisma = new PrismaClient();

function parseCookie(header: string | null, name: string) {
  if (!header) return null;
  const cookies = header.split(";").map((c) => c.trim());
  for (const c of cookies) {
    const [k, ...v] = c.split("=");
    if (k === name) return v.join("=");
  }
  return null;
}

function expiredCookie(name: string) {
  return `${name}=deleted; Path=/; HttpOnly; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=${process.env.AUTH_COOKIE_SAME_SITE || "strict"}${process.env.AUTH_COOKIE_SECURE === "true" ? "; Secure" : ""}`;
}

export async function POST(req: Request) {
  const rlMeta = rateLimit(req.headers);
  if (!rlMeta.ok) {
    return withRateLimitHeaders(new Response(JSON.stringify({ error: "Zu viele Anfragen" }), { status: 429, headers: { "content-type": "application/json" } }), rlMeta);
  }

  const cookieHeader = req.headers.get("cookie");
  const name = process.env.AUTH_COOKIE_NAME || "aki.session";
  const token = parseCookie(cookieHeader, name);

  try {
    if (token) {
      await prisma.session.deleteMany({ where: { token } });
    }

    const resp = new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "content-type": "application/json", "Set-Cookie": expiredCookie(name) },
    });

    return withRateLimitHeaders(resp, rlMeta);
  } catch (err: any) {
    console.error("logout error:", err);
    return withRateLimitHeaders(new Response(JSON.stringify({ error: "Serverfehler" }), { status: 500, headers: { "content-type": "application/json" } }), rlMeta);
  }
}
