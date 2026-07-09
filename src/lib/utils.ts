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

export function parseDateWithTime(dateStr: string | null | undefined, timeStr: string | null | undefined): { date: Date | null; time: Date | null } {
  if (!dateStr) return { date: null, time: null };

  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return { date: null, time: null };

  let time: Date | null = null;
  if (timeStr) {
    const combined = new Date(dateStr);
    const [h, m] = timeStr.split(":").map(Number);
    if (!isNaN(h) && !isNaN(m)) {
      combined.setHours(h, m, 0, 0);
      time = combined;
    }
  }

  return { date, time };
}


