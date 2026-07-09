import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Avtorizatsiyadan o'tilmagan" }, { status: 401 });
    }
    const userId = session.user.id;

    await db.$transaction(async (tx) => {
      await tx.reminder.deleteMany({ where: { task: { userId } } });
      await tx.subTask.deleteMany({ where: { task: { userId } } });
      await tx.attachment.deleteMany({ where: { task: { userId } } });
      await tx.task.deleteMany({ where: { userId } });
      await tx.category.deleteMany({ where: { userId } });
      await tx.tag.deleteMany({ where: { userId } });
      await tx.streak.deleteMany({ where: { userId } });
      await tx.notification.deleteMany({ where: { userId } });
    });

    return NextResponse.json({ success: true, message: "Barcha ma'lumotlar o'chirildi" });
  } catch (e) {
    console.error("POST /api/clear-data error:", e);
    return NextResponse.json({ error: "Ma'lumotlarni o'chirishda xatolik" }, { status: 500 });
  }
}
