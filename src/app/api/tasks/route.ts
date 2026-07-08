import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { createTaskSchema } from "@/lib/schemas";
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Avtorizatsiyadan o'tilmagan" }, { status: 401 });
    const userId = session.user.id;

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
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  if (!rateLimit(`tasks-create:${ip}`, 20, 60_000).success) {
    return rateLimitResponse();
  }

  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Avtorizatsiyadan o'tilmagan" }, { status: 401 });
    const userId = session.user.id;

    const raw = await req.json();
    const parsed = createTaskSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Noto'g'ri ma'lumot" }, { status: 400 });
    }

    const { title, description, priority, dueDate: dDate, dueTime: dTime, category, isRecurring, recurrence } = parsed.data;

    let dueDate: Date | null = null;
    if (dDate) {
      dueDate = new Date(dDate as string);
      if (isNaN(dueDate.getTime())) dueDate = null;
    }
    let dueTime: Date | null = null;
    if (dTime && dDate) {
      const combined = new Date(dDate as string);
      const [h, m] = (dTime as string).split(":").map(Number);
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
        priority,
        dueDate,
        dueTime,
        isRecurring,
        recurrence: recurrence || null,
        categoryId,
        userId,
      },
      include: { category: true, subtasks: true, tags: true, reminders: true, attachments: true },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (e) {
    console.error("POST /api/tasks error:", e);
    return NextResponse.json({ error: "Xatolik yuz berdi" }, { status: 500 });
  }
}
