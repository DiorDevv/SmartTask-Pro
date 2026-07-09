import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  checkAndCreateDueNotifications,
  createNotification,
} from "@/lib/notifications";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";

const ALLOWED_NOTIFICATION_TYPES = ["task_due", "task_completed", "task_overdue", "streak", "system"];

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Avtorizatsiyadan o'tilmagan" }, { status: 401 });

    const url = new URL(req.url);
    const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get("limit") || "20")));

    await checkAndCreateDueNotifications(session.user.id);

    const [notifications, unreadCount] = await Promise.all([
      getNotifications(session.user.id, limit),
      getUnreadCount(session.user.id),
    ]);

    return NextResponse.json({ notifications, unreadCount });
  } catch (e) {
    console.error("GET /api/notifications error:", e);
    return NextResponse.json({ error: "Xatolik yuz berdi" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Avtorizatsiyadan o'tilmagan" }, { status: 401 });

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || req.headers.get("x-real-ip")
      || "unknown";
    if (!rateLimit(`notifications:${ip}`, 30, 60_000).success) {
      return rateLimitResponse();
    }

    const body = await req.json();

    if (body.all) {
      await markAllAsRead(session.user.id);
      return NextResponse.json({ success: true });
    }

    if (body.ids && Array.isArray(body.ids) && body.ids.length > 0) {
      await markAsRead(session.user.id, body.ids);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "ids yoki all parametri talab qilinadi" }, { status: 400 });
  } catch (e) {
    console.error("PATCH /api/notifications error:", e);
    return NextResponse.json({ error: "Xatolik yuz berdi" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Avtorizatsiyadan o'tilmagan" }, { status: 401 });

    const body = await req.json();
    const { type, title, message, taskId } = body;
    if (!type || !title) {
      return NextResponse.json({ error: "type va title talab qilinadi" }, { status: 400 });
    }
    if (!ALLOWED_NOTIFICATION_TYPES.includes(type)) {
      return NextResponse.json({ error: "Noto'g'ri bildirishnoma turi" }, { status: 400 });
    }

    const notification = await createNotification({
      userId: session.user.id,
      type,
      title,
      message,
      taskId,
    });

    return NextResponse.json(notification, { status: 201 });
  } catch (e) {
    console.error("POST /api/notifications error:", e);
    return NextResponse.json({ error: "Xatolik yuz berdi" }, { status: 500 });
  }
}
