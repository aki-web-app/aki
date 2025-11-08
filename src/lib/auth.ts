import argon2 from 'argon2';
import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

export async function hashPassword(pw: string) {
  return argon2.hash(pw, { type: argon2.argon2id });
}
export async function verifyPassword(hash: string, pw: string) {
  return argon2.verify(hash, pw);
}

export async function createAuthToken(userId: string, type: 'VERIFY'|'RESET', ttlSeconds: number) {
  const token = randomUUID();
  const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
  return prisma.authToken.create({ data: { userId, type, token, expiresAt }});
}

export async function createSession(userId: string, ttlDays = 7) {
  const token = randomUUID();
  const expiresAt = new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000);
  return prisma.session.create({ data: { userId, token, expiresAt }});
}

export function buildSessionCookie(token: string, days = 7) {
  const maxAge = days * 24 * 60 * 60;
  const secure = process.env.AUTH_COOKIE_SECURE === 'true';
  const sameSite = process.env.AUTH_COOKIE_SAME_SITE || 'strict';
  const name = process.env.AUTH_COOKIE_NAME || 'aki.session';
  // Example Set-Cookie value (server-side Next API/Response handling)
  return `${name}=${token}; Max-Age=${maxAge}; Path=/; HttpOnly; Secure=${secure}; SameSite=${sameSite}`;
}
