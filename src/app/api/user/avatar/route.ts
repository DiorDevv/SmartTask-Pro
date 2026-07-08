import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Avtorizatsiyadan o'tilmagan" }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get("avatar") as File | null;
    if (!file) return NextResponse.json({ error: "Rasm fayli yuklanmadi" }, { status: 400 });

    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!ext || !["png", "jpg", "jpeg", "gif", "webp"].includes(ext)) {
      return NextResponse.json({ error: "Faqat PNG, JPG, GIF, WEBP formatlari qabul qilinadi" }, { status: 400 });
    }
    if (file.size > 1_048_576) {
      return NextResponse.json({ error: "Rasm hajmi 1MB dan oshmasligi kerak" }, { status: 400 });
    }

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    const fileName = `${session.user.id}_${Date.now()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(uploadsDir, fileName), buffer);

    const avatarUrl = `/uploads/${fileName}`;
    await db.user.update({ where: { id: session.user.id }, data: { avatar: avatarUrl } });

    return NextResponse.json({ avatar: avatarUrl });
  } catch (e) {
    console.error("POST /api/user/avatar error:", e);
    return NextResponse.json({ error: "Rasm yuklashda xatolik" }, { status: 500 });
  }
}
