import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";

const ALLOWED_MIME = ["image/png", "image/jpeg", "image/gif", "image/webp"];
const ALLOWED_EXT = ["png", "jpg", "jpeg", "gif", "webp"];
const MAX_SIZE = 1_048_576;

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Avtorizatsiyadan o'tilmagan" }, { status: 401 });

    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    if (!(await rateLimit(`avatar:${ip}`, 10, 60_000)).success) {
      return rateLimitResponse();
    }

    const formData = await req.formData();
    const file = formData.get("avatar") as File | null;
    if (!file) return NextResponse.json({ error: "Rasm fayli yuklanmadi" }, { status: 400 });

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "Rasm hajmi 1MB dan oshmasligi kerak" }, { status: 400 });
    }

    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!ext || !ALLOWED_EXT.includes(ext)) {
      return NextResponse.json({ error: "Faqat PNG, JPG, GIF, WEBP formatlari qabul qilinadi" }, { status: 400 });
    }

    if (!ALLOWED_MIME.includes(file.type)) {
      return NextResponse.json({ error: "Noto'g'ri fayl turi" }, { status: 400 });
    }

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    const fileName = `${session.user.id}_${Date.now()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(uploadsDir, fileName), buffer);

    const currentUser = await db.user.findUnique({
      where: { id: session.user.id },
      select: { avatar: true },
    });

    if (currentUser?.avatar?.startsWith("/uploads/")) {
      const oldPath = path.join(process.cwd(), "public", currentUser.avatar);
      try { await unlink(oldPath); } catch { /* file may not exist */ }
    }

    const avatarUrl = `/uploads/${fileName}`;
    await db.user.update({ where: { id: session.user.id }, data: { avatar: avatarUrl } });

    return NextResponse.json({ avatar: avatarUrl });
  } catch (e) {
    console.error("POST /api/user/avatar error:", e);
    return NextResponse.json({ error: "Rasm yuklashda xatolik" }, { status: 500 });
  }
}
