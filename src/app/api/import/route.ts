import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import type { ExportData } from "@/lib/export-utils";
import { parseXlsxToJson } from "@/lib/export-utils";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Avtorizatsiyadan o'tilmagan" }, { status: 401 });
    }
    const userId = session.user.id;

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || req.headers.get("x-real-ip")
      || "unknown";
    if (!rateLimit(`import:${ip}`, 5, 60_000).success) {
      return rateLimitResponse();
    }

    const contentType = req.headers.get("content-type") || "";

    let data: ExportData;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      if (!file) {
        return NextResponse.json({ error: "Fayl yuklanmadi" }, { status: 400 });
      }
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (ext === "xlsx") {
        const buf = await file.arrayBuffer();
        data = await parseXlsxToJson(buf);
      } else {
        const text = await file.text();
        data = JSON.parse(text) as ExportData;
      }
    } else {
      const body = await req.json();
      data = body as ExportData;
    }

    if (!data.tasks || !Array.isArray(data.tasks)) {
      return NextResponse.json({ error: "Noto'g'ri format: tasks massivi topilmadi" }, { status: 400 });
    }

    let imported = 0;
    let errors = 0;

    for (const t of data.tasks) {
      try {
        let categoryId: string | null = null;
        if (t.category?.name) {
          const existing = await db.category.findFirst({
            where: { name: t.category.name, userId },
          });
          if (existing) {
            categoryId = existing.id;
          } else {
            const created = await db.category.create({
              data: { name: t.category.name, color: t.category.color || "#6366F1", userId },
            });
            categoryId = created.id;
          }
        }

        let tagIds: string[] = [];
        if (t.tags && t.tags.length > 0) {
          for (const tg of t.tags) {
            const existing = await db.tag.findFirst({
              where: { name: tg.name, userId },
            });
            if (existing) {
              tagIds.push(existing.id);
            } else {
              const created = await db.tag.create({
                data: { name: tg.name, color: tg.color, userId },
              });
              tagIds.push(created.id);
            }
          }
        }

        const task = await db.task.create({
          data: {
            title: t.title,
            description: t.description,
            status: (t.status as any) || "PENDING",
            priority: (t.priority as any) || "MEDIUM",
            dueDate: t.dueDate ? new Date(t.dueDate) : null,
            dueTime: t.dueTime ? new Date(t.dueTime) : null,
            isRecurring: t.isRecurring ?? false,
            recurrence: t.recurrence,
            completedAt: t.completedAt ? new Date(t.completedAt) : null,
            archivedAt: t.archivedAt ? new Date(t.archivedAt) : null,
            categoryId,
            userId,
            tags: tagIds.length > 0 ? { connect: tagIds.map((id) => ({ id })) } : undefined,
          },
        });

        if (t.subtasks && t.subtasks.length > 0) {
          for (const st of t.subtasks) {
            await db.subTask.create({
              data: { title: st.title, completed: st.completed, taskId: task.id },
            });
          }
        }

        if (t.reminders && t.reminders.length > 0) {
          for (const rm of t.reminders) {
            await db.reminder.create({
              data: {
                remindAt: new Date(rm.remindAt),
                type: rm.type,
                taskId: task.id,
              },
            });
          }
        }

        imported++;
      } catch {
        errors++;
      }
    }

    return NextResponse.json({
      imported,
      errors,
      total: data.tasks.length,
      message: `${imported} ta vazifa import qilindi, ${errors} ta xatolik`,
    });
  } catch (e) {
    console.error("POST /api/import error:", e);
    return NextResponse.json({ error: "Importda xatolik yuz berdi" }, { status: 500 });
  }
}