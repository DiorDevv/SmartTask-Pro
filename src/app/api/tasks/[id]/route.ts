import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { updateStreak } from "@/lib/streak";
import { handleRecurringTask } from "@/lib/recurring";
import { updateTaskSchema, zodErr } from "@/lib/schemas";

async function getOwnedTask(id: string, userId: string) {
  const task = await db.task.findUnique({ where: { id } });
  if (!task) return null;
  if (task.userId !== userId) return null;
  return task;
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Avtorizatsiyadan o'tilmagan" }, { status: 401 });

    const { id } = await params;
    const existing = await getOwnedTask(id, session.user.id);
    if (!existing) return NextResponse.json({ error: "Vazifa topilmadi" }, { status: 404 });

    await db.task.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("DELETE /api/tasks/[id] error:", e);
    return NextResponse.json({ error: "Xatolik yuz berdi" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Avtorizatsiyadan o'tilmagan" }, { status: 401 });

    const { id } = await params;
    const existing = await getOwnedTask(id, session.user.id);
    if (!existing) return NextResponse.json({ error: "Vazifa topilmadi" }, { status: 404 });

    const raw = await req.json();
    const parsed = updateTaskSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: zodErr(parsed.error) }, { status: 400 });
    }

    const { title, description, status, priority, dueDate, dueTime, category: catName, isRecurring, recurrence } = parsed.data;

    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) {
      updateData.status = status;
      updateData.completedAt = status === "COMPLETED" ? new Date() : null;
    }
    if (priority !== undefined) updateData.priority = priority;
    if (dueDate !== undefined) {
      updateData.dueDate = dueDate ? new Date(dueDate) : null;
    }
    if (dueTime !== undefined) {
      updateData.dueTime = dueTime ? new Date(dueTime) : null;
    }
    if (isRecurring !== undefined) updateData.isRecurring = isRecurring;
    if (recurrence !== undefined) updateData.recurrence = recurrence;
    if (catName !== undefined) {
      if (catName) {
        const existing = await db.category.findFirst({ where: { name: catName, userId: session.user.id } });
        if (existing) {
          updateData.categoryId = existing.id;
        } else {
          const created = await db.category.create({
            data: { name: catName, color: "#6366F1", userId: session.user.id },
          });
          updateData.categoryId = created.id;
        }
      } else {
        updateData.categoryId = null;
      }
    }

    const task = await db.task.update({
      where: { id },
      data: updateData,
    });

    if (status === "COMPLETED") {
      await updateStreak(session.user.id);
      if (existing.isRecurring) {
        await handleRecurringTask(id);
      }
    }

    return NextResponse.json(task);
  } catch (e) {
    console.error("PATCH /api/tasks/[id] error:", e);
    if (e instanceof Error && "code" in e && (e as any).code === "P2025") {
      return NextResponse.json({ error: "Vazifa topilmadi" }, { status: 404 });
    }
    return NextResponse.json({ error: "Xatolik yuz berdi" }, { status: 500 });
  }
}
