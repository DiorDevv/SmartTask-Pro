import { db } from "./db";

export async function updateStreak(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let streak = await db.streak.findFirst({ where: { userId } });
  if (!streak) {
    streak = await db.streak.create({ data: { userId } });
  }

  const completedToday = await db.task.count({
    where: {
      userId,
      status: "COMPLETED",
      completedAt: { gte: today },
    },
  });

  if (completedToday === 0) return streak;

  const lastActive = streak.lastActive ? new Date(streak.lastActive) : null;
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  let newStreak = streak.currentStreak;

  if (!lastActive) {
    newStreak = 1;
  } else {
    const lastDate = new Date(lastActive);
    lastDate.setHours(0, 0, 0, 0);
    const diffDays = Math.round((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return streak;
    } else if (diffDays === 1) {
      newStreak += 1;
    } else {
      newStreak = 1;
    }
  }

  return db.streak.update({
    where: { userId },
    data: {
      currentStreak: newStreak,
      longestStreak: Math.max(newStreak, streak.longestStreak),
      lastActive: today,
    },
  });
}
