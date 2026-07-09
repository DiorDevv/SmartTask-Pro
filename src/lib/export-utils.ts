import { db } from "./db";
import ExcelJS from "exceljs";

function normalizeStr(val: unknown): string {
  if (!val) return "";
  return String(val).trim();
}

function parseStatus(val: string): string {
  const s = val.toUpperCase();
  if (["BAJARILDI", "COMPLETED"].includes(s)) return "COMPLETED";
  if (["JARAYONDA", "IN_PROGRESS"].includes(s)) return "IN_PROGRESS";
  if (["KUTILMOQDA", "PENDING"].includes(s)) return "PENDING";
  if (["QILINMADI", "FAILED"].includes(s)) return "FAILED";
  if (["BEKOR QILINDI", "CANCELLED"].includes(s)) return "CANCELLED";
  if (["KECHIKTIRILDI", "POSTPONED"].includes(s)) return "POSTPONED";
  return "PENDING";
}

function parsePriority(val: string): string {
  const s = val.toUpperCase();
  if (["FAVQULODDA", "URGENT"].includes(s)) return "URGENT";
  if (["YUQORI", "HIGH"].includes(s)) return "HIGH";
  if (["O'RTA", "ORTA", "MEDIUM"].includes(s)) return "MEDIUM";
  if (["PAST", "LOW"].includes(s)) return "LOW";
  return "MEDIUM";
}

function parseBool(val: string): boolean {
  const s = val.toLowerCase().trim();
  return s === "ha" || s === "yes" || s === "true" || s === "1";
}

function parseDate(val: unknown): string | null {
  if (!val) return null;
  if (val instanceof Date && !isNaN(val.getTime())) {
    const y = val.getFullYear();
    const m = String(val.getMonth() + 1).padStart(2, "0");
    const d = String(val.getDate()).padStart(2, "0");
    const h = String(val.getHours()).padStart(2, "0");
    const min = String(val.getMinutes()).padStart(2, "0");
    const s = String(val.getSeconds()).padStart(2, "0");
    const ms = String(val.getMilliseconds()).padStart(3, "0");
    if (h === "00" && min === "00" && s === "00" && ms === "000") {
      return `${y}-${m}-${d}T00:00:00.000Z`;
    }
    return `${y}-${m}-${d}T${h}:${min}:${s}.${ms}Z`;
  }
  const str = String(val).trim();
  if (!str) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return `${str}T00:00:00.000Z`;
  const dd = str.match(/^(\d{2})[./](\d{2})[./](\d{4})$/);
  if (dd) return `${dd[3]}-${dd[2]}-${dd[1]}T00:00:00.000Z`;
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

function parseTime(val: unknown): string | null {
  if (!val) return null;
  if (val instanceof Date && !isNaN(val.getTime())) {
    return val.toISOString();
  }
  const str = String(val).trim();
  if (!str) return null;
  const parts = str.match(/^(\d{2}):(\d{2})$/);
  if (parts) {
    return `1970-01-01T${parts[1]}:${parts[2]}:00.000Z`;
  }
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

function parseSubtaskLine(line: string): { title: string; completed: boolean } | null {
  const t = line.replace(/^[✓○✔✗✘]\s*/, "").trim();
  if (!t) return null;
  const completed = line.startsWith("✓") || line.startsWith("✔");
  return { title: t, completed };
}

export interface ExportTask {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: string | null;
  dueTime: string | null;
  isRecurring: boolean;
  recurrence: string | null;
  completedAt: string | null;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
  category: { name: string; color: string } | null;
  subtasks: { title: string; completed: boolean }[];
  tags: { name: string; color: string | null }[];
  reminders: { remindAt: string; type: string; sent: boolean }[];
  attachments: { name: string; url: string; type: string; size: number }[];
}

export interface ExportData {
  exportedAt: string;
  version: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    timezone: string;
    theme: string;
    language: string;
  };
  stats: {
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    inProgressTasks: number;
    categoriesCount: number;
    tagsCount: number;
    currentStreak: number;
    longestStreak: number;
  };
  tasks: ExportTask[];
}

export async function getFullExportData(userId: string): Promise<ExportData> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, timezone: true, theme: true, language: true },
  });
  if (!user) throw new Error("Foydalanuvchi topilmadi");

  const tasks = await db.task.findMany({
    where: { userId },
    include: {
      category: { select: { name: true, color: true } },
      subtasks: { select: { title: true, completed: true } },
      tags: { select: { name: true, color: true } },
      reminders: { select: { remindAt: true, type: true, sent: true } },
      attachments: { select: { name: true, url: true, type: true, size: true } },
    },
  });

  const categories = await db.category.count({ where: { userId } });
  const tags = await db.tag.count({ where: { userId } });
  const streak = await db.streak.findUnique({ where: { userId } });

  const completed = tasks.filter((t) => t.status === "COMPLETED").length;
  const pending = tasks.filter((t) => t.status === "PENDING").length;
  const inProgress = tasks.filter((t) => t.status === "IN_PROGRESS").length;

  return {
    exportedAt: new Date().toISOString(),
    version: "1.0",
    user,
    stats: {
      totalTasks: tasks.length,
      completedTasks: completed,
      pendingTasks: pending,
      inProgressTasks: inProgress,
      categoriesCount: categories,
      tagsCount: tags,
      currentStreak: streak?.currentStreak ?? 0,
      longestStreak: streak?.longestStreak ?? 0,
    },
    tasks: tasks.map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      status: t.status,
      priority: t.priority,
      dueDate: t.dueDate?.toISOString() ?? null,
      dueTime: t.dueTime?.toISOString() ?? null,
      isRecurring: t.isRecurring,
      recurrence: t.recurrence,
      completedAt: t.completedAt?.toISOString() ?? null,
      archivedAt: t.archivedAt?.toISOString() ?? null,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
      category: t.category,
      subtasks: t.subtasks,
      tags: t.tags,
      reminders: t.reminders.map((r) => ({
        remindAt: r.remindAt.toISOString(),
        type: r.type,
        sent: r.sent,
      })),
      attachments: t.attachments,
    })),
  };
}

export function jsonToCsv(data: ExportData): string {
  const rows: string[][] = [];

  rows.push(["Reja Export", new Date().toISOString()]);
  rows.push([]);
  rows.push(["Foydalanuvchi: " + data.user.name || data.user.email]);
  rows.push([]);
  rows.push(["Statistika"]);
  rows.push(["Jami vazifalar", String(data.stats.totalTasks)]);
  rows.push(["Bajarilgan", String(data.stats.completedTasks)]);
  rows.push(["Kutilayotgan", String(data.stats.pendingTasks)]);
  rows.push(["Jarayonda", String(data.stats.inProgressTasks)]);
  rows.push(["Kategoriyalar", String(data.stats.categoriesCount)]);
  rows.push(["Teglar", String(data.stats.tagsCount)]);
  rows.push(["Streak", String(data.stats.currentStreak)]);
  rows.push([]);

  const headers = [
    "ID", "Sarlavha", "Tavsif", "Status", "Ustuvorlik",
    "Muddat", "Vaqt", "Takrorlanuvchi", "Takrorlash",
    "Bajarilgan vaqti", "Arxivlangan", "Yaratilgan", "Yangilangan",
    "Kategoriya", "Kategoriya rangi",
    "Sub-vazifalar", "Teglar",
  ];
  rows.push(headers);

  for (const t of data.tasks) {
    const subtaskStr = t.subtasks.map((s) => `${s.title}(${s.completed ? "✓" : "○"})`).join("; ");
    const tagStr = t.tags.map((tg) => tg.name).join("; ");
    rows.push([
      t.id, t.title, t.description ?? "", t.status, t.priority,
      t.dueDate ?? "", t.dueTime ?? "", String(t.isRecurring), t.recurrence ?? "",
      t.completedAt ?? "", t.archivedAt ?? "", t.createdAt, t.updatedAt,
      t.category?.name ?? "", t.category?.color ?? "",
      subtaskStr, tagStr,
    ]);
  }

  return rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
}

export async function jsonToXlsx(data: ExportData): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = data.user.name || data.user.email;
  wb.created = new Date();

  const indigo = "6366F1";
  const emerald = "10B981";
  const amber = "F59E0B";
  const gray = "6B7280";
  const lightBg = "F8FAFC";
  const borderColor = "E2E8F0";

  function addSummarySheet() {
    const ws = wb.addWorksheet("Umumiy", { views: [{ showGridLines: false }] });

    ws.mergeCells("A1:B1");
    const title = ws.getCell("A1");
    title.value = "REJA - Vazifalar Hisoboti";
    title.font = { name: "Arial", size: 16, bold: true, color: { argb: indigo } };
    title.alignment = { vertical: "middle", horizontal: "left" };
    ws.getRow(1).height = 35;

    ws.addRow([]);

    const infoData = [
      ["Foydalanuvchi", data.user.name || data.user.email],
      ["Eksport sanasi", new Date().toLocaleString("uz-UZ")],
    ];
    infoData.forEach(([k, v]) => {
      const r = ws.addRow([k, v]);
      r.getCell(1).font = { bold: true, color: { argb: gray } };
      r.getCell(2).font = { color: { argb: "1F2937" } };
    });

    ws.addRow([]);
    ws.mergeCells("A6:B6");
    const sectionTitle = ws.getCell("A6");
    sectionTitle.value = "Umumiy statistika";
    sectionTitle.font = { name: "Arial", size: 12, bold: true, color: { argb: indigo } };
    ws.getRow(6).height = 28;

    const statsRows = [
      ["Ko'rsatkich", "Qiymat"],
      ["Jami vazifalar", data.stats.totalTasks],
      ["Bajarilgan", data.stats.completedTasks],
      ["Jarayonda", data.stats.inProgressTasks],
      ["Kutilayotgan", data.stats.pendingTasks],
      ["Kategoriyalar", data.stats.categoriesCount],
      ["Teglar", data.stats.tagsCount],
      ["Joriy strek", `${data.stats.currentStreak} kun`],
    ];

    statsRows.forEach((rowData, idx) => {
      const r = ws.addRow(rowData);
      if (idx === 0) {
        r.eachCell((c) => {
          c.font = { bold: true, color: { argb: "FFFFFF" }, name: "Arial" };
          c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: indigo } };
          c.border = {
            top: { style: "thin" }, left: { style: "thin" },
            bottom: { style: "thin" }, right: { style: "thin" },
          };
        });
      } else {
        r.eachCell((c) => {
          c.font = { name: "Arial", color: { argb: "1F2937" } };
          c.border = {
            top: { style: "thin", color: { argb: borderColor } },
            left: { style: "thin", color: { argb: borderColor } },
            bottom: { style: "thin", color: { argb: borderColor } },
            right: { style: "thin", color: { argb: borderColor } },
          };
          if (idx % 2 === 0) {
            c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: lightBg } };
          }
        });
      }
    });

    ws.getColumn(1).width = 22;
    ws.getColumn(2).width = 18;
  }

  function addTasksSheet() {
    const ws = wb.addWorksheet("Vazifalar", { views: [{ showGridLines: false }] });
    const labels: Record<string, string> = {
      COMPLETED: "Bajarildi", IN_PROGRESS: "Jarayonda", PENDING: "Kutilmoqda",
      FAILED: "Qilinmadi", CANCELLED: "Bekor qilindi", POSTPONED: "Kechiktirildi",
    };
    const priorityLabel: Record<string, string> = {
      URGENT: "Favqulodda", HIGH: "Yuqori", MEDIUM: "O'rta", LOW: "Past",
    };
    const statusColors: Record<string, string> = {
      COMPLETED: emerald, IN_PROGRESS: "3B82F6", PENDING: amber,
      FAILED: "EF4444", CANCELLED: gray, POSTPONED: "F97316",
    };

    const colWidths = [38, 50, 16, 14, 16, 12, 14, 16, 18, 35, 22, 35, 30, 16, 16, 16];
    const headers = [
      "Sarlavha", "Tavsif", "Status", "Ustuvorlik",
      "Muddat", "Vaqt", "Takrorlanuvchi", "Takrorlash",
      "Kategoriya", "Sub-vazifalar", "Teglar",
      "Eslatmalar", "Fayllar", "Bajarilgan", "Yaratilgan", "Arxivlangan",
    ];

    const headerRow = ws.addRow(headers);
    headerRow.height = 28;
    headerRow.eachCell((c) => {
      c.font = { bold: true, color: { argb: "FFFFFF" }, name: "Arial", size: 11 };
      c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: indigo } };
      c.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
      c.border = {
        top: { style: "thin" }, left: { style: "thin" },
        bottom: { style: "thin", color: { argb: indigo } }, right: { style: "thin" },
      };
    });

    data.tasks.forEach((t, taskIdx) => {
      const subtaskStr = t.subtasks.map((s) => `${s.completed ? "✓" : "○"} ${s.title}`).join("\n");
      const tagStr = t.tags.map((tg) => tg.name).join(", ");
      const reminderStr = t.reminders.map((r) => `${new Date(r.remindAt).toISOString()} (${r.type})`).join("\n");
      const attachStr = t.attachments.map((a) => a.name).join("\n");
      const statusLabel = labels[t.status] || t.status;
      const prioLabel = priorityLabel[t.priority] || t.priority;

      const row = ws.addRow([
        t.title,
        t.description ?? "",
        statusLabel,
        prioLabel,
        t.dueDate ? new Date(t.dueDate).toLocaleDateString("uz-UZ") : "",
        t.dueTime ? new Date(t.dueTime).toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" }) : "",
        t.isRecurring ? "Ha" : "Yo'q",
        t.recurrence ?? "",
        t.category?.name ?? "",
        subtaskStr || "",
        tagStr,
        reminderStr || "",
        attachStr || "",
        t.completedAt ? new Date(t.completedAt).toLocaleDateString("uz-UZ") : "",
        new Date(t.createdAt).toLocaleDateString("uz-UZ"),
        t.archivedAt ? new Date(t.archivedAt).toLocaleDateString("uz-UZ") : "",
      ]);
      row.height = Math.max(20, 18 + (t.subtasks.length * 15) + (t.reminders.length * 15));

      const bgColor = taskIdx % 2 === 0 ? "FFFFFF" : lightBg;

      row.eachCell((c, col) => {
        c.font = { name: "Arial", size: 10, color: { argb: "1F2937" } };
        c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bgColor } };
        c.alignment = { vertical: "top", wrapText: true };
        c.border = {
          top: { style: "thin", color: { argb: borderColor } },
          left: { style: "thin", color: { argb: borderColor } },
          bottom: { style: "thin", color: { argb: borderColor } },
          right: { style: "thin", color: { argb: borderColor } },
        };

        if (col === 3) {
          c.font = { bold: true, color: { argb: statusColors[t.status] || gray }, name: "Arial", size: 10 };
          c.alignment = { vertical: "top", horizontal: "center", wrapText: true };
        }
        if (col === 4) {
          const prioColors: Record<string, string> = { URGENT: "EF4444", HIGH: "F97316", MEDIUM: "3B82F6", LOW: gray };
          c.font = { color: { argb: prioColors[t.priority] || gray }, name: "Arial", size: 10 };
          c.alignment = { vertical: "top", horizontal: "center", wrapText: true };
        }
        if (col === 1) {
          c.font = { bold: true, name: "Arial", size: 10, color: { argb: "1F2937" } };
        }
      });
    });

    colWidths.forEach((w, i) => { ws.getColumn(i + 1).width = w; });
  }

  addSummarySheet();
  addTasksSheet();

  const buf = await wb.xlsx.writeBuffer();
  return Buffer.from(buf);
}

function detectXlsxFormat(row: ExcelJS.Row): "old" | "new" {
  const cells: unknown[] = [];
  row.eachCell((c) => cells.push(c.value));
  return cells.length >= 14 ? "new" : "old";
}

export async function parseXlsxToJson(buffer: ArrayBuffer): Promise<ExportData> {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buffer);

  const tasksSheet = wb.getWorksheet("Vazifalar");
  if (!tasksSheet) throw new Error("XLSX faylda 'Vazifalar' varag'i topilmadi");

  const tasks: ExportTask[] = [];

  const headerRow = tasksSheet.getRow(1);
  const format = detectXlsxFormat(headerRow);

  tasksSheet.eachRow((row, rowNum) => {
    if (rowNum === 1) return;

    const title = normalizeStr(row.getCell(1).value);
    if (!title) return;

    let subtaskCol: number, tagCol: number, catCol: number;
    let completedCol: number, createdAtCol: number, archivedCol: number;
    let reminderCol: number, attachCol: number, recurringCol: number, recurCol: number;

    if (format === "new") {
      subtaskCol = 10; tagCol = 11; catCol = 9;
      completedCol = 14; createdAtCol = 15; archivedCol = 16;
      reminderCol = 12; attachCol = 13; recurringCol = 7; recurCol = 8;
    } else {
      subtaskCol = 8; tagCol = 9; catCol = 7;
      completedCol = 10; createdAtCol = 11; archivedCol = 0;
      reminderCol = 0; attachCol = 0; recurringCol = 0; recurCol = 0;
    }

    const subtaskRaw = normalizeStr(row.getCell(subtaskCol).value);
    const subtasks = subtaskRaw
      ? subtaskRaw.split("\n").map(parseSubtaskLine).filter(Boolean) as { title: string; completed: boolean }[]
      : [];

    const tagsRaw = normalizeStr(row.getCell(tagCol).value);
    const tags = tagsRaw
      ? tagsRaw.split(",").filter(Boolean).map((t) => ({ name: t.trim(), color: null }))
      : [];

    let reminders: ExportTask["reminders"] = [];
    if (reminderCol > 0) {
      const reminderRaw = normalizeStr(row.getCell(reminderCol).value);
      reminders = reminderRaw
        ? reminderRaw.split("\n").filter(Boolean).map((line) => {
            const dateStr = line.replace(/\s*\(.*\)$/, "").trim();
            let remindAt: string;
            const d = new Date(dateStr);
            if (!isNaN(d.getTime())) {
              remindAt = d.toISOString();
            } else {
              const parts = dateStr.match(/^(\d{2})[./](\d{2})[./](\d{4}),?\s*(\d{2}:\d{2}:\d{2})?/);
              if (parts) {
                remindAt = `${parts[3]}-${parts[2]}-${parts[1]}T${parts[4] || "00:00:00"}.000Z`;
              } else {
                remindAt = new Date().toISOString();
              }
            }
            return {
              remindAt,
              type: (line.match(/\((\w+)\)/) || [])[1] || "POPUP",
              sent: false,
            };
          })
        : [];
    }

    let attachments: ExportTask["attachments"] = [];
    if (attachCol > 0) {
      const attachRaw = normalizeStr(row.getCell(attachCol).value);
      attachments = attachRaw
        ? attachRaw.split("\n").filter(Boolean).map((name) => ({
            id: "", name: name.trim(), url: "", type: "file", size: 0,
          }))
        : [];
    }

    const raw7 = normalizeStr(row.getCell(7).value);
    const catCell = catCol > 0 ? row.getCell(catCol) : null;

    tasks.push({
      id: "",
      title,
      description: normalizeStr(row.getCell(2).value) || null,
      status: parseStatus(normalizeStr(row.getCell(3).value)),
      priority: parsePriority(normalizeStr(row.getCell(4).value)),
      dueDate: parseDate(row.getCell(5).value),
      dueTime: row.getCell(6).value ? parseTime(row.getCell(6).value) : null,
      isRecurring: recurringCol > 0 ? parseBool(normalizeStr(row.getCell(recurringCol).value)) : false,
      recurrence: recurCol > 0 ? normalizeStr(row.getCell(recurCol).value) || null : null,
      completedAt: row.getCell(completedCol).value ? parseDate(row.getCell(completedCol).value) : null,
      archivedAt: archivedCol > 0 && row.getCell(archivedCol).value ? parseDate(row.getCell(archivedCol).value) : null,
      createdAt: row.getCell(createdAtCol).value ? parseDate(row.getCell(createdAtCol).value) || new Date().toISOString() : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      category: format === "old" && raw7
        ? { name: raw7, color: "#6366F1" }
        : catCell?.value
          ? { name: normalizeStr(catCell.value), color: "#6366F1" }
          : null,
      subtasks,
      tags,
      reminders,
      attachments,
    });
  });

  return {
    exportedAt: new Date().toISOString(),
    version: "1.0",
    user: { id: "", name: "", email: "", timezone: "", theme: "system", language: "uz" },
    stats: { totalTasks: tasks.length, completedTasks: 0, pendingTasks: 0, inProgressTasks: 0, categoriesCount: 0, tagsCount: 0, currentStreak: 0, longestStreak: 0 },
    tasks,
  };
}