// src/app/api/auth/request-reset/route.ts
import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";
import { rateLimit, withRateLimitHeaders } from "@/lib/rate-limit";
import { sendMail } from "@/lib/mailer";

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
  const email = (body?.email || "").toString().trim().toLowerCase();

  if (!email) {
    return withRateLimitHeaders(jsonResponse({ ok: true }), rlMeta); // neutral
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return withRateLimitHeaders(jsonResponse({ ok: true }), rlMeta); // neutral response
    }

    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1h
    await prisma.authToken.create({
      data: { userId: user.id, type: "RESET", token, expiresAt },
    });

    const base = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "http://localhost:3000";
    const link = `${base}/reset?token=${token}`;

    const html = `
      <p>Hallo${user.name ? ` ${user.name}` : ""},</p>
      <p>Du hast ein Zurücksetzen des Passworts angefordert. Klicke hier, um ein neues Passwort zu setzen:</p>
      <p><a href="${link}">Passwort zurücksetzen</a></p>
      <p>Wenn du diese Anfrage nicht gestellt hast, ignoriere diese Nachricht.</p>
    `;

    await sendMail({ to: email, subject: "Aki — Passwort zurücksetzen", html });

    return withRateLimitHeaders(jsonResponse({ ok: true }), rlMeta);
  } catch (err: any) {
    console.error("request-reset error:", err);
    return withRateLimitHeaders(jsonResponse({ error: "Serverfehler" }, 500), rlMeta);
  }
}
