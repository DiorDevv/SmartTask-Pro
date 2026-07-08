import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Avtorizatsiyadan o'tilmagan" }, { status: 401 });

    let streak = await db.streak.findUnique({
      where: { userId: session.user.id },
    });

    if (!streak) {
      streak = await db.streak.create({
        data: { userId: session.user.id },
      });
    }

    return NextResponse.json(streak);
  } catch (e) {
    console.error("GET /api/streak error:", e);
    return NextResponse.json({ error: "Xatolik yuz berdi" }, { status: 500 });
  }
}
