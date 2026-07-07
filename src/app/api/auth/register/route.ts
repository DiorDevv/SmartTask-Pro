import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email va parol talab qilinadi" }, { status: 400 });
    }

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Bu email allaqachon ro'yxatdan o'tgan" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await db.user.create({
      data: { name, email, password: hashedPassword },
    });

    return NextResponse.json({ id: user.id, email: user.email, name: user.name }, { status: 201 });
  } catch (e) {
    console.error("Register error:", e);
    const message = e instanceof Error ? e.message : "Xatolik yuz berdi";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
