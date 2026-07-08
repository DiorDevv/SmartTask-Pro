import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  const existing = await db.user.findUnique({ where: { email: "demo@reja.uz" } });
  if (existing) {
    console.log("Demo user already exists, skipping seed.");
    return;
  }

  const hashedPassword = await bcrypt.hash("demo123", 12);

  const user = await db.user.create({
    data: {
      email: "demo@reja.uz",
      name: "Demo User",
      password: hashedPassword,
      timezone: "Asia/Tashkent",
      theme: "system",
      language: "uz",
    },
  });

  const category = await db.category.create({
    data: { name: "Ish", color: "#6366F1", userId: user.id },
  });

  await db.task.create({
    data: {
      title: "Loyihani boshlash",
      description: "Reja loyihasini ishga tushirish va test qilish",
      status: "IN_PROGRESS",
      priority: "HIGH",
      dueDate: new Date(),
      categoryId: category.id,
      userId: user.id,
    },
  });

  await db.task.create({
    data: {
      title: "Kodni review qilish",
      description: "Har kuni kod sifatini tekshirish",
      status: "PENDING",
      priority: "MEDIUM",
      dueDate: new Date(new Date().setDate(new Date().getDate() + 1)),
      categoryId: category.id,
      userId: user.id,
    },
  });

  console.log(`Seed created: demo@reja.uz / demo123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
