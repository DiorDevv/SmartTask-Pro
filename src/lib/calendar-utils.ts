import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  addDays, format, getHours,
} from "date-fns";
import { uz } from "date-fns/locale";
import { TaskStatus } from "@/types";
import type { Task } from "@/types";

export type CalendarView = "month" | "week" | "day" | "agenda";

export function getMonthDays(date: Date): Date[] {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(monthStart);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days: Date[] = [];
  let d = calStart;
  while (d <= calEnd) {
    days.push(d);
    d = addDays(d, 1);
  }
  return days;
}

export function getWeekDays(date: Date): Date[] {
  const weekStart = startOfWeek(date, { weekStartsOn: 1 });
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
}

export function getDayHours(): number[] {
  return Array.from({ length: 16 }, (_, i) => i + 7);
}

export function formatMonth(date: Date): string {
  return format(date, "MMMM yyyy", { locale: uz });
}

export function formatDate(date: Date): string {
  return format(date, "d MMMM, EEEE", { locale: uz });
}

export function formatTime(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function getTaskTimeKey(task: Task): string {
  if (!task.dueDate) return "";
  return format(new Date(task.dueDate), "yyyy-MM-dd");
}

export function getTaskHour(task: Task): number {
  if (!task.dueTime) return -1;
  return getHours(new Date(task.dueTime));
}

export function isOverdue(task: Task): boolean {
  if (!task.dueDate) return false;
  return new Date(task.dueDate) < new Date() && task.status !== TaskStatus.COMPLETED && task.status !== TaskStatus.CANCELLED;
}

export const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-500",
  IN_PROGRESS: "bg-blue-500",
  COMPLETED: "bg-emerald-500",
  FAILED: "bg-red-500",
  POSTPONED: "bg-orange-500",
  CANCELLED: "bg-gray-500",
};

export const PRIORITY_DOTS: Record<string, string> = {
  LOW: "bg-gray-400",
  MEDIUM: "bg-blue-500",
  HIGH: "bg-orange-500",
  URGENT: "bg-red-500",
};

export const PRIORITY_LABELS: Record<string, string> = {
  LOW: "Past",
  MEDIUM: "O'rta",
  HIGH: "Yuqori",
  URGENT: "Favqulodda",
};

export const STATUS_LABELS: Record<string, string> = {
  PENDING: "Bajarilmagan",
  IN_PROGRESS: "Bajarilmoqda",
  COMPLETED: "Bajarildi",
  FAILED: "Qilinmadi",
  POSTPONED: "Kechiktirildi",
  CANCELLED: "Bekor qilindi",
};

export const WEEK_DAYS = ["Du", "Se", "Ch", "Pa", "Ju", "Sh", "Ya"];
export const WEEK_DAYS_FULL = ["Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba", "Yakshanba"];
