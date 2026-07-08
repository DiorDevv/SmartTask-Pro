import { NextResponse } from "next/server";

const rateMap = new Map<string, { count: number; resetAt: number }>();

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateMap) {
    if (now > entry.resetAt) rateMap.delete(key);
  }
}, 60_000);

export function rateLimit(
  key: string,
  limit = 30,
  windowMs = 60_000
): { success: boolean } {
  const now = Date.now();
  const cleanKey = key.split(",")[0].trim();
  const entry = rateMap.get(cleanKey);

  if (!entry || now > entry.resetAt) {
    rateMap.set(cleanKey, { count: 1, resetAt: now + windowMs });
    return { success: true };
  }

  if (entry.count >= limit) {
    return { success: false };
  }

  entry.count++;
  return { success: true };
}

export function rateLimitResponse() {
  return NextResponse.json(
    { error: "Juda ko'p so'rov yuborildi. Birozdan so'ng qayta urinib ko'ring." },
    { status: 429 }
  );
}
