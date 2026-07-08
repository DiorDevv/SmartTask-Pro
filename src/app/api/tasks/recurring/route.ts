import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { handleRecurringTask } from "@/lib/recurring";

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  if (!rateLimit(`recurring:${ip}`, 5, 60_000).success) {
    return rateLimitResponse();
  }

  try {
    const overdue = await db.task.findMany({
      where: {
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
