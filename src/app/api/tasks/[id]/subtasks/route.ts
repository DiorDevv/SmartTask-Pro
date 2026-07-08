import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { createSubtaskSchema } from "@/lib/schemas";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Avtorizatsiyadan o'tilmagan" }, { status: 401 });

    const { id } = await params;
    const task = await db.task.findUnique({ where: { id } });
    if (!task || task.userId !== session.user.id) {
      return NextResponse.json({ error: "Vazifa topilmadi" }, { status: 404 });
    }

    const raw = await req.json();
    const parsed = createSubtaskSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Noto'g'ri ma'lumot" }, { status: 400 });
    }

    const subtask = await db.subTask.create({
      data: { title: parsed.data.title.trim(), taskId: id },
    });

    return NextResponse.json(subtask, { status: 201 });
  } catch (e) {
    console.error("POST /api/tasks/[id]/subtasks error:", e);
    return NextResponse.json({ error: "Xatolik yuz berdi" }, { status: 500 });
  }
}
