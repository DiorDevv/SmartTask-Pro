import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import crypto from "crypto";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { forgotPasswordSchema } from "@/lib/schemas";

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || req.headers.get("x-real-ip")
    || "unknown";
  if (!rateLimit(`forgot-password:${ip}`, 3, 60_000).success) {
    return rateLimitResponse();
  }

  try {
    const raw = await req.json();
    const parsed = forgotPasswordSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Noto'g'ri ma'lumot" }, { status: 400 });
    }

    const { email } = parsed.data;

    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ message: "Agar email tizimda mavjud bo'lsa, parolni tiklash linki yuboriladi" });
    }

    await db.passwordResetToken.deleteMany({ where: { email } });

    const token = crypto.randomBytes(32).toString("hex");
    await db.passwordResetToken.create({
      data: {
        email,
        token,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    const resetUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/auth/reset-password?token=${token}`;
    console.log(`[RESET PASSWORD] Email: ${email} -> ${resetUrl}`);

    return NextResponse.json({ message: "Agar email tizimda mavjud bo'lsa, parolni tiklash linki yuboriladi" });
  } catch (e) {
    console.error("POST /api/auth/forgot-password error:", e);
    return NextResponse.json({ error: "Xatolik yuz berdi" }, { status: 500 });
  }
}
