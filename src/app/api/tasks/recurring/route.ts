import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { handleRecurringTask } from "@/lib/recurring";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Avtorizatsiyadan o'tilmagan" }, { status: 401 });

    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    if (!rateLimit(`recurring:${ip}`, 5, 60_000).success) {
      return rateLimitResponse();
    }

    const overdue = await db.task.findMany({
      where: {
        userId: session.user.id,
        isRecurring: true,
        status: { not: "COMPLETED" },
        dueDate: { lte: new Date() },
      },
    });

    const processed: string[] = [];
    for (const task of overdue) {
      await db.task.update({ where: { id: task.id }, data: { status: "COMPLETED", completedAt: new Date() } });
      await handleRecurringTask(task.id);
      processed.push(task.id);
    }

    return NextResponse.json({ processed: processed.length });
  } catch (e) {
    console.error("Recurring processing error:", e);
    return NextResponse.json({ error: "Xatolik yuz berdi" }, { status: 500 });
  }
}
