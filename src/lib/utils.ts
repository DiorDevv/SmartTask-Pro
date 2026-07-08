import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

const UZ_WEEKDAYS = ["Yakshanba", "Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba"];
const UZ_MONTHS = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"];

function toDate(date: Date | string | null | undefined): Date | null {
  if (!date) return null;
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;
  return d;
}

export function formatDate(date: Date | string | null | undefined): string {
  const d = toDate(date);
  if (!d) return "";
  return `${d.getDate()}-${UZ_MONTHS[d.getMonth()]}, ${d.getFullYear()}`;
}

export function formatDateFull(date: Date | string | null | undefined): string {
  const d = toDate(date);
  if (!d) return "";
  return `${UZ_WEEKDAYS[d.getDay()]}, ${d.getDate()}-${UZ_MONTHS[d.getMonth()]}, ${d.getFullYear()}`;
}

export function formatTime(date: Date | string | null | undefined): string {
  const d = toDate(date);
  if (!d) return "";
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
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
