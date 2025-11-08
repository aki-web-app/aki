// src/app/api/auth/register/route.ts
import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";
import { rateLimit, withRateLimitHeaders } from "@/lib/rate-limit";
import { hashPassword } from "@/lib/auth";
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
    return withRateLimitHeaders(
      jsonResponse({ error: "Zu viele Anfragen" }, 429),
      rlMeta
    );
  }

  const body = await req.json().catch(() => ({} as any));
  const email = (body?.email || "").toString().trim().toLowerCase();
  const password = (body?.password || "").toString();
  const name = (body?.name || "").toString().trim();

  if (!email || !password || password.length < 8) {
    return withRateLimitHeaders(
      jsonResponse({ error: "Ungültige Eingabe" }, 400),
      rlMeta
    );
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email } });

    // Neutral response: don't reveal existence
    if (existing) {
      return withRateLimitHeaders(
        jsonResponse({ ok: true }),
        rlMeta
      );
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { email, passwordHash, name: name || null },
    });

    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
    await prisma.authToken.create({
      data: {
        userId: user.id,
        type: "VERIFY",
        token,
        expiresAt,
      },
    });

    const base = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "http://localhost:3000";
    const link = `${base}/api/auth/verify-email?token=${token}`;

    const html = `
      <p>Hallo${name ? ` ${name}` : ""},</p>
      <p>Bitte bestätige deine E-Mail, indem du auf den folgenden Link klickst:</p>
      <p><a href="${link}">E-Mail verifizieren</a></p>
      <p>Wenn du diese Anfrage nicht gestellt hast, ignoriere diese Nachricht.</p>
    `;

    await sendMail({ to: email, subject: "Aki — Bitte E-Mail verifizieren", html });

    return withRateLimitHeaders(jsonResponse({ ok: true }), rlMeta);
  } catch (err: any) {
    console.error("register error:", err);
    return withRateLimitHeaders(jsonResponse({ error: "Serverfehler" }, 500), rlMeta);
  }
}
