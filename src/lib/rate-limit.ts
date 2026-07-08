import { NextResponse } from "next/server";

const rateMap = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(
  key: string,
  limit = 30,
  windowMs = 60_000
): { success: boolean } {
  const now = Date.now();
  const entry = rateMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateMap.set(key, { count: 1, resetAt: now + windowMs });
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
