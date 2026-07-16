import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { db } from "@/lib/db";
import { handleRecurringTask } from "@/lib/recurring";

function isValidCronSecret(authHeader: string | null, secret: string): boolean {
  const expected = Buffer.from(`Bearer ${secret}`);
  const actual = Buffer.from(authHeader || "");
  if (expected.length !== actual.length) return false;
  return timingSafeEqual(expected, actual);
}

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error("GET /api/cron/recurring: CRON_SECRET sozlanmagan");
    return NextResponse.json({ error: "CRON_SECRET sozlanmagan" }, { status: 500 });
  }

  const authHeader = req.headers.get("authorization");
  if (!isValidCronSecret(authHeader, secret)) {
    return NextResponse.json({ error: "Ruxsat etilmagan" }, { status: 401 });
  }

  try {
    const overdue = await db.task.findMany({
      where: {
        isRecurring: true,
        status: { not: "COMPLETED" },
        dueDate: { lte: new Date() },
        archivedAt: null,
      },
      select: { id: true },
    });

    let processed = 0;
    for (const task of overdue) {
      await db.task.update({
        where: { id: task.id },
        data: { status: "COMPLETED", completedAt: new Date() },
      });
      await handleRecurringTask(task.id);
      processed++;
    }

    return NextResponse.json({ processed });
  } catch (e) {
    console.error("GET /api/cron/recurring error:", e);
    return NextResponse.json({ error: "Xatolik yuz berdi" }, { status: 500 });
  }
}
