import { z, ZodError } from "zod";

const validStatuses = ["PENDING", "IN_PROGRESS", "COMPLETED", "FAILED", "POSTPONED", "CANCELLED"] as const;
const validPriorities = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;
const validRecurrences = ["daily", "weekly", "monthly"] as const;
const validThemes = ["light", "dark", "system"] as const;
const validLanguages = ["uz", "en", "ru"] as const;

const reqStr = (msg: string) => z.string().min(1, msg);
const reqEmail = (msg: string) => z.string().min(1, msg).email("Noto'g'ri email format");

export function zodErr(err: unknown): string {
  if (err instanceof ZodError) {
    const issue = err.issues[0];
    if (issue?.code === "invalid_type") {
      const field = issue.path.join(".");
      const fieldMsgs: Record<string, string> = {
        title: "Sarlavha talab qilinadi",
        email: "Email talab qilinadi",
        password: "Parol talab qilinadi",
        token: "Token talab qilinadi",
        name: "Ism talab qilinadi",
      };
      return fieldMsgs[field] || "Maydon talab qilinadi";
    }
    return issue?.message || "Noto'g'ri ma'lumot";
  }
  return "Noto'g'ri ma'lumot";
}

export const createTaskSchema = z.object({
  title: reqStr("Vazifa nomi talab qilinadi").max(200, "Sarlavha 200 belgidan oshmasligi kerak"),
  description: z.string().max(5000, "Tavsif 5000 belgidan oshmasligi kerak").nullable().optional(),
  priority: z.enum(validPriorities).optional().default("MEDIUM"),
  dueDate: z.string().optional().nullable(),
  dueTime: z.string().optional().nullable(),
  category: z.string().max(50, "Kategoriya nomi 50 belgidan oshmasligi kerak").optional().nullable(),
  isRecurring: z.boolean().optional().default(false),
  recurrence: z.enum(validRecurrences).optional().nullable(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(200, "Sarlavha 200 belgidan oshmasligi kerak").optional(),
  description: z.string().max(5000, "Tavsif 5000 belgidan oshmasligi kerak").nullable().optional(),
  status: z.enum(validStatuses).optional(),
  priority: z.enum(validPriorities).optional(),
  dueDate: z.string().optional().nullable(),
  dueTime: z.string().optional().nullable(),
  category: z.string().max(50).optional().nullable(),
  isRecurring: z.boolean().optional(),
  recurrence: z.enum(validRecurrences).optional().nullable(),
});

export const createSubtaskSchema = z.object({
  title: reqStr("Sub-vazifa nomi talab qilinadi").max(200, "Sub-vazifa nomi 200 belgidan oshmasligi kerak"),
});

export const updateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  timezone: z.string().max(50).optional(),
  theme: z.enum(validThemes).optional(),
  language: z.enum(validLanguages).optional(),
});

export const deleteAccountSchema = z.object({
  password: reqStr("Parol talab qilinadi"),
});

export const forgotPasswordSchema = z.object({
  email: reqEmail("Email talab qilinadi"),
});

export const resetPasswordSchema = z.object({
  token: reqStr("Token talab qilinadi"),
  password: reqStr("Parol talab qilinadi").min(6, "Parol kamida 6 belgidan iborat bo'lishi kerak"),
});

export const registerSchema = z.object({
  name: reqStr("Ism talab qilinadi").max(100),
  email: reqEmail("Email talab qilinadi"),
  password: reqStr("Parol talab qilinadi").min(6, "Parol kamida 6 belgidan iborat bo'lishi kerak"),
});
