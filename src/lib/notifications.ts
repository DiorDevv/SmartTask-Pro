import { db } from "./db";

const NOTIFICATION_TYPES = {
  TASK_DUE: "task_due",
  TASK_COMPLETED: "task_completed",
  TASK_OVERDUE: "task_overdue",
  STREAK: "streak",
  SYSTEM: "system",
} as const;

export async function getNotifications(userId: string, limit = 20) {
  return db.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getUnreadCount(userId: string) {
  return db.notification.count({
    where: { userId, read: false },
  });
}

export async function markAsRead(userId: string, ids: string[]) {
  await db.notification.updateMany({
    where: { userId, id: { in: ids } },
    data: { read: true },
  });
}

export async function markAllAsRead(userId: string) {
  await db.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });
}

export async function createNotification(params: {
  userId: string;
  type: string;
  title: string;
  message?: string;
  taskId?: string;
}) {
  return db.notification.create({
    data: {
      userId: params.userId,
      type: params.type,
      title: params.title,
      message: params.message || null,
      taskId: params.taskId || null,
    },
  });
}

export async function checkAndCreateDueNotifications(userId: string) {
  const now = new Date();
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const dueTasks = await db.task.findMany({
    where: {
      userId,
      archivedAt: null,
      status: { notIn: ["COMPLETED", "CANCELLED"] },
      dueDate: { gte: now, lte: in24h },
    },
    select: { id: true, title: true, dueDate: true },
  });

  const existing = await db.notification.findMany({
    where: {
      userId,
      type: NOTIFICATION_TYPES.TASK_DUE,
      taskId: { in: dueTasks.map((t) => t.id) },
    },
    select: { taskId: true },
  });

  const existingTaskIds = new Set(existing.map((n) => n.taskId));

  const created: { id: string; title: string }[] = [];
  for (const task of dueTasks) {
    if (!existingTaskIds.has(task.id)) {
      const hoursLeft = Math.round((task.dueDate!.getTime() - now.getTime()) / (1000 * 60 * 60));
      const n = await createNotification({
        userId,
        type: NOTIFICATION_TYPES.TASK_DUE,
        title: `Vazifa muddati yaqin`,
        message: `"${task.title}" — ${hoursLeft} soat qoldi`,
        taskId: task.id,
      });
      created.push({ id: n.id, title: task.title });
    }
  }

  const overdueTasks = await db.task.findMany({
    where: {
      userId,
      archivedAt: null,
      status: { notIn: ["COMPLETED", "CANCELLED"] },
      dueDate: { lt: now },
    },
    select: { id: true, title: true, dueDate: true },
  });

  const existingOverdue = await db.notification.findMany({
    where: {
      userId,
      type: NOTIFICATION_TYPES.TASK_OVERDUE,
      taskId: { in: overdueTasks.map((t) => t.id) },
    },
    select: { taskId: true },
  });

  const existingOverdueIds = new Set(existingOverdue.map((n) => n.taskId));

  for (const task of overdueTasks) {
    if (!existingOverdueIds.has(task.id)) {
      await createNotification({
        userId,
        type: NOTIFICATION_TYPES.TASK_OVERDUE,
        title: `Vazifa muddati o'tgan`,
        message: `"${task.title}" — muddati ${task.dueDate?.toLocaleDateString("uz-UZ")}`,
        taskId: task.id,
      });
    }
  }

  return created;
}

export async function notifyTaskCompleted(userId: string, taskTitle: string, taskId: string) {
  return createNotification({
    userId,
    type: NOTIFICATION_TYPES.TASK_COMPLETED,
    title: `Vazifa bajarildi`,
    message: `"${taskTitle}" muvaffaqiyatli bajarildi`,
    taskId,
  });
}
