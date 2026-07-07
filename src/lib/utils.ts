import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

const UZ_WEEKDAYS = ["Yakshanba", "Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba"];
const UZ_MONTHS = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"];

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  const day = d.getDate();
  const month = UZ_MONTHS[d.getMonth()];
  const year = d.getFullYear();
  return `${day}-${month}, ${year}`;
}

export function formatDateFull(date: Date | string): string {
  const d = new Date(date);
  const weekday = UZ_WEEKDAYS[d.getDay()];
  const day = d.getDate();
  const month = UZ_MONTHS[d.getMonth()];
  const year = d.getFullYear();
  return `${weekday}, ${day}-${month}, ${year}`;
}

export function formatTime(date: Date | string): string {
  const d = new Date(date);
  const hours = d.getHours().toString().padStart(2, "0");
  const minutes = d.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

export function getTimeRemaining(dueDate: Date): string {
  const now = new Date();
  const diff = dueDate.getTime() - now.getTime();
  if (diff < 0) return "Muddati o'tgan";
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days} kun qoldi`;
  }
  return `${hours} soat ${minutes} daqiqa qoldi`;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PENDING: "#F59E0B",
    IN_PROGRESS: "#3B82F6",
    COMPLETED: "#10B981",
    FAILED: "#EF4444",
    POSTPONED: "#F97316",
    CANCELLED: "#6B7280",
  };
  return colors[status] || "#6B7280";
}
