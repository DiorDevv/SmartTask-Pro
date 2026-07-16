import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { changePasswordSchema, zodErr } from "@/lib/schemas";

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Avtorizatsiyadan o'tilmagan" }, { status: 401 });

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || req.headers.get("x-real-ip")
      || "unknown";
    if (!(await rateLimit(`change-password:${ip}`, 5, 60_000)).success) {
      return rateLimitResponse();
    }

    const raw = await req.json();
    const parsed = changePasswordSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: zodErr(parsed.error) }, { status: 400 });
    }

    const { currentPassword, newPassword } = parsed.data;

    const user = await db.user.findUnique({ where: { id: session.user.id } });
    if (!user) return NextResponse.json({ error: "Foydalanuvchi topilmadi" }, { status: 404 });

    if (!user.password) {
      return NextResponse.json(
        { error: "Bu hisobda parol o'rnatilmagan (ijtimoiy tarmoq orqali kirilgan)" },
        { status: 400 }
      );
    }

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) return NextResponse.json({ error: "Joriy parol noto'g'ri" }, { status: 403 });

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await db.user.update({ where: { id: session.user.id }, data: { password: hashedPassword } });

    return NextResponse.json({ success: true, message: "Parol muvaffaqiyatli yangilandi" });
  } catch (e) {
    console.error("PATCH /api/user/password error:", e);
    return NextResponse.json({ error: "Xatolik yuz berdi" }, { status: 500 });
  }
}
