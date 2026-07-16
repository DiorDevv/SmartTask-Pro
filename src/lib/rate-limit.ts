import { NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

const redisLimiters = new Map<string, Ratelimit>();

function getRedisLimiter(limit: number, windowMs: number): Ratelimit {
  const cacheKey = `${limit}:${windowMs}`;
  let limiter = redisLimiters.get(cacheKey);
  if (!limiter) {
    limiter = new Ratelimit({
      redis: redis!,
      limiter: Ratelimit.slidingWindow(limit, `${windowMs} ms`),
      analytics: false,
      prefix: "reja-rl",
    });
    redisLimiters.set(cacheKey, limiter);
  }
  return limiter;
}

// Bitta instansiya doirasida ishlaydigan zaxira variant (Redis sozlanmagan bo'lsa,
// masalan Docker/local muhitda). Vercel kabi ko'p-instansiyali muhitda Redis tavsiya etiladi.
const memoryMap = new Map<string, { count: number; resetAt: number }>();

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of memoryMap) {
    if (now > entry.resetAt) memoryMap.delete(key);
  }
}, 60_000);

function rateLimitInMemory(key: string, limit: number, windowMs: number): { success: boolean } {
  const now = Date.now();
  const entry = memoryMap.get(key);

  if (!entry || now > entry.resetAt) {
    memoryMap.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true };
  }

  if (entry.count >= limit) {
    return { success: false };
  }

  entry.count++;
  return { success: true };
}

export async function rateLimit(
  key: string,
  limit = 30,
  windowMs = 60_000
): Promise<{ success: boolean }> {
  const cleanKey = key.split(",")[0].trim();

  if (redis) {
    try {
      const limiter = getRedisLimiter(limit, windowMs);
      const { success } = await limiter.limit(cleanKey);
      return { success };
    } catch (e) {
      console.error("Rate limit (Redis) xatosi, in-memory'ga o'tildi:", e);
      return rateLimitInMemory(cleanKey, limit, windowMs);
    }
  }

  return rateLimitInMemory(cleanKey, limit, windowMs);
}

export function rateLimitResponse() {
  return NextResponse.json(
    { error: "Juda ko'p so'rov yuborildi. Birozdan so'ng qayta urinib ko'ring." },
    { status: 429 }
  );
}
