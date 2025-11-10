// src/lib/ensure-auth.ts
export const runtime = 'nodejs';

import { PrismaClient, User } from '@prisma/client';

const prisma = new PrismaClient();

const COOKIE_NAME = process.env.AUTH_COOKIE_NAME || 'aki.session';
const COOKIE_SAMESITE = (process.env.AUTH_COOKIE_SAME_SITE || 'strict') as
  | 'strict'
  | 'lax'
  | 'none';
const COOKIE_SECURE = process.env.AUTH_COOKIE_SECURE === 'true';

function parseCookies(header = ''): Record<string, string> {
  return header
    .split(';')
    .map(s => s.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((acc, cur) => {
      const eq = cur.indexOf('=');
      if (eq === -1) return acc;
      const k = cur.slice(0, eq);
      const v = cur.slice(eq + 1);
      acc[k] = decodeURIComponent(v);
      return acc;
    }, {});
}

function json(data: unknown, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json', ...headers },
  });
}

/**
 * Greift robust auf das Session-Model zu – auch wenn der generierte
 * Prisma-Client auf dem Build-Host (noch) keine Typen für `session` enthält.
 */
function getSessionModel() {
  const anyPrisma = prisma as any;
  const model = anyPrisma?.session;
  if (!model?.findUnique || !model?.deleteMany) {
    // Fällt früh & aussagekräftig, statt kryptisch in der Query zu scheitern
    throw new Error(
      'Prisma client is outdated: Model `Session` not found on PrismaClient. ' +
      'Run `npx prisma generate` before building.'
    );
  }
  return model as {
    findUnique: (args: { where: { token: string }, include?: { user?: boolean } }) => Promise<any>;
    deleteMany: (args: { where: { id?: string, userId?: string } }) => Promise<any>;
  };
}

/**
 * Holt die Session aus dem Request (Cookie) – inkl. User.
 * - Löscht abgelaufene Sessions best-effort.
 * - Gibt `null` zurück, wenn keine gültige Session existiert.
 */
export async function getSessionFromRequest(req: Request) {
  const cookieHeader = req.headers.get('cookie') || '';
  const cookies = parseCookies(cookieHeader);
  const token = cookies[COOKIE_NAME];
  if (!token) return null;

  const Session = getSessionModel();

  const session = await Session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session) return null;

  const now = Date.now();
  const exp = new Date(session.expiresAt).getTime();
  if (isNaN(exp) || exp <= now) {
    await Session.deleteMany({ where: { id: session.id } }).catch(() => void 0);
    return null;
  }

  return session;
}

/**
 * Stellt sicher, dass ein Benutzer authentifiziert ist.
 * - Gibt den `User` zurück, falls authentifiziert.
 * - Wirft `Response(401)`, falls nicht authentifiziert.
 */
export async function ensureAuth(req: Request): Promise<User> {
  const session = await getSessionFromRequest(req);
  if (!session) throw json({ message: 'Unauthorized' }, 401);
  return session.user as User;
}

export function buildClearSessionCookie() {
  return `${COOKIE_NAME}=; Max-Age=0; Path=/; HttpOnly; SameSite=${COOKIE_SAMESITE}; Secure=${COOKIE_SECURE}`;
}
