import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { updateUserSchema, deleteAccountSchema, zodErr } from "@/lib/schemas";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Avtorizatsiyadan o'tilmagan" }, { status: 401 });

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, name: true, email: true, avatar: true, timezone: true, theme: true, language: true, createdAt: true },
    });
    if (!user) return NextResponse.json({ error: "Foydalanuvchi topilmadi" }, { status: 404 });

    return NextResponse.json(user);
  } catch (e) {
    console.error("GET /api/user error:", e);
    return NextResponse.json({ error: "Xatolik yuz berdi" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Avtorizatsiyadan o'tilmagan" }, { status: 401 });

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || req.headers.get("x-real-ip")
      || "unknown";
    if (!rateLimit(`user:${ip}`, 30, 60_000).success) {
      return rateLimitResponse();
    }

    const raw = await req.json();
    const parsed = updateUserSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: zodErr(parsed.error) }, { status: 400 });
    }

    const updateData: Record<string, string> = {};
    for (const [key, value] of Object.entries(parsed.data)) {
      if (value !== undefined) updateData[key] = value as string;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "Hech qanday o'zgarish kiritilmadi" }, { status: 400 });
    }

    const user = await db.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: { id: true, name: true, email: true, avatar: true, timezone: true, theme: true, language: true },
    });

    return NextResponse.json(user);
  } catch (e) {
    console.error("PATCH /api/user error:", e);
    return NextResponse.json({ error: "Xatolik yuz berdi" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Avtorizatsiyadan o'tilmagan" }, { status: 401 });

    const raw = await req.json();
    const parsed = deleteAccountSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: zodErr(parsed.error) }, { status: 400 });
    }

    const { password } = parsed.data;
    const user = await db.user.findUnique({ where: { id: session.user.id } });
    if (!user) return NextResponse.json({ error: "Foydalanuvchi topilmadi" }, { status: 404 });

    if (user.password) {
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) return NextResponse.json({ error: "Noto'g'ri parol" }, { status: 403 });
    }

    await db.user.delete({ where: { id: session.user.id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("DELETE /api/user error:", e);
    return NextResponse.json({ error: "Xatolik yuz berdi" }, { status: 500 });
  }
}
