import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const existing = await db.task.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Vazifa topilmadi" }, { status: 404 });

    await db.task.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Xatolik yuz berdi" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const existing = await db.task.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Vazifa topilmadi" }, { status: 404 });

    const data = await req.json();
    const task = await db.task.update({
      where: { id },
      data,
      include: { category: true, subtasks: true, tags: true, reminders: true, attachments: true },
    });

    return NextResponse.json(task);
  } catch {
    return NextResponse.json({ error: "Xatolik yuz berdi" }, { status: 500 });
  }
}
