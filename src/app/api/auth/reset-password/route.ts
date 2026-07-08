import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { resetPasswordSchema, zodErr } from "@/lib/schemas";

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || req.headers.get("x-real-ip")
    || "unknown";
  if (!rateLimit(`reset-password:${ip}`, 3, 60_000).success) {
    return rateLimitResponse();
  }

  try {
    const raw = await req.json();
    const parsed = resetPasswordSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: zodErr(parsed.error) }, { status: 400 });
    }

    const { token, password } = parsed.data;

    const resetToken = await db.passwordResetToken.findUnique({ where: { token } });
    if (!resetToken) {
      return NextResponse.json({ error: "Yaroqsiz yoki muddati o'tgan token" }, { status: 400 });
    }
    if (resetToken.expiresAt < new Date()) {
      await db.passwordResetToken.delete({ where: { id: resetToken.id } });
      return NextResponse.json({ error: "Token muddati o'tgan" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    await db.user.update({
      where: { email: resetToken.email },
      data: { password: hashedPassword },
    });

    await db.passwordResetToken.delete({ where: { id: resetToken.id } });

    return NextResponse.json({ message: "Parol muvaffaqiyatli yangilandi" });
  } catch (e) {
    console.error("POST /api/auth/reset-password error:", e);
    return NextResponse.json({ error: "Xatolik yuz berdi" }, { status: 500 });
  }
}
