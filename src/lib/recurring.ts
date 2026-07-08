import { db } from "./db";

function getNextDate(pattern: string, from: Date): Date {
  const next = new Date(from);
  switch (pattern) {
    case "daily":
      next.setDate(next.getDate() + 1);
      break;
    case "weekly":
      next.setDate(next.getDate() + 7);
      break;
    case "monthly":
      next.setMonth(next.getMonth() + 1);
      break;
  }
  return next;
}

export async function handleRecurringTask(taskId: string) {
  const task = await db.task.findUnique({
    where: { id: taskId },
    include: { subtasks: true },
  });

  if (!task || !task.isRecurring || !task.recurrence) return;

  const nextDueDate = task.dueDate
    ? getNextDate(task.recurrence, task.dueDate)
    : null;

  const nextDueTime = task.dueTime
    ? getNextDate(task.recurrence, task.dueTime)
    : null;

  const newTask = await db.task.create({
    data: {
      title: task.title,
      description: task.description,
      status: "PENDING",
      priority: task.priority,
      dueDate: nextDueDate,
      dueTime: nextDueTime,
      isRecurring: task.isRecurring,
      recurrence: task.recurrence,
      categoryId: task.categoryId,
      userId: task.userId,
    },
  });

  for (const sub of task.subtasks) {
    await db.subTask.create({
      data: { title: sub.title, taskId: newTask.id },
    });
  }
}
