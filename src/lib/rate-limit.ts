// src/lib/rate-limit.ts
type Bucket = { tokens: number; updatedAt: number };
const store = new Map<string, Bucket>();

const POINTS   = parseInt(process.env.RATE_LIMIT_POINTS   || "60", 10); // erlaubte Requests je Fenster
const DURATION = parseInt(process.env.RATE_LIMIT_DURATION || "60", 10); // Fenster in Sekunden
const BURST    = parseInt(process.env.RATE_LIMIT_BURST    || "20", 10); // kurzfristige Spitze

export function getClientIp(headers: Headers): string {
  const xff = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const real = headers.get("x-real-ip")?.trim();
  const cf = headers.get("cf-connecting-ip")?.trim();
  return xff || real || cf || "unknown";
}

function allow(key: string) {
  const now = Date.now();
  const refillPerMs = POINTS / (DURATION * 1000);
  const b = store.get(key) || { tokens: POINTS, updatedAt: now };

  const elapsed = now - b.updatedAt;
  b.tokens = Math.min(POINTS + BURST, b.tokens + elapsed * refillPerMs);
  b.updatedAt = now;

  if (b.tokens >= 1) {
    b.tokens -= 1;
    store.set(key, b);
    return { ok: true, remaining: Math.floor(b.tokens) };
  } else {
    store.set(key, b);
    return { ok: false, remaining: 0 };
  }
}

export function rateLimit(headers: Headers) {
  const ip = getClientIp(headers);
  const key = `ip:${ip}`;
  const res = allow(key);
  return { ok: res.ok, remaining: res.remaining, limit: POINTS, window: DURATION };
}

export function withRateLimitHeaders(resp: Response, meta: {remaining:number, limit:number, window:number}) {
  resp.headers.set("X-RateLimit-Limit", String(meta.limit));
  resp.headers.set("X-RateLimit-Remaining", String(meta.remaining));
  resp.headers.set("X-RateLimit-Window", `${meta.window}s`);
  return resp;
}
