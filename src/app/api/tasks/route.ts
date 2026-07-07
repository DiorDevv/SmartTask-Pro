import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user?.id || (await db.user.findFirst())?.id;
    if (!userId) return NextResponse.json({ error: "Foydalanuvchi topilmadi" }, { status: 401 });

    const tasks = await db.task.findMany({
      where: { userId, archivedAt: null },
      include: { category: true, subtasks: true, tags: true, reminders: true, attachments: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(tasks);
  } catch (e) {
    console.error("GET /api/tasks error:", e);
    return NextResponse.json({ error: "Xatolik yuz berdi" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id || (await db.user.findFirst())?.id;
    if (!userId) return NextResponse.json({ error: "Foydalanuvchi topilmadi" }, { status: 401 });

    const { title, description, priority, dueDate: dDate, dueTime: dTime, category, isRecurring, recurrence } = await req.json();

    if (!title?.trim()) return NextResponse.json({ error: "Vazifa nomi talab qilinadi" }, { status: 400 });

    let dueDate: Date | null = null;
    if (dDate) {
      dueDate = new Date(dDate);
      if (isNaN(dueDate.getTime())) dueDate = null;
    }
    let dueTime: Date | null = null;
    if (dTime && dDate) {
      const combined = new Date(dDate);
      const [h, m] = dTime.split(":").map(Number);
      if (!isNaN(h) && !isNaN(m)) {
        combined.setHours(h, m, 0, 0);
        dueTime = combined;
      }
    }

    let categoryId: string | null = null;
    if (category) {
      const existing = await db.category.findFirst({ where: { name: category, userId } });
      if (existing) {
        categoryId = existing.id;
      } else {
        const created = await db.category.create({
          data: { name: category, color: "#6366F1", userId },
        });
        categoryId = created.id;
      }
    }

    const task = await db.task.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        priority: priority || "MEDIUM",
        dueDate,
        dueTime,
        isRecurring: isRecurring || false,
        recurrence: recurrence || null,
        categoryId,
        userId,
      },
      include: { category: true, subtasks: true, tags: true, reminders: true, attachments: true },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (e) {
    console.error("POST /api/tasks error:", e);
    const message = e instanceof Error ? e.message : "Xatolik yuz berdi";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
