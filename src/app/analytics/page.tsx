"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LoaderCircle,
  Search,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Circle,
  Tag,
  Paperclip,
  Bell,
  ListTodo,
  FileJson,
  FileSpreadsheet,
  FileDown,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPie,
  Pie,
  Cell,
} from "recharts";
import { useTasks } from "@/hooks/use-tasks";
import { useStreak } from "@/hooks/use-streak";
import { useThemeStore } from "@/store/theme-store";
import { TaskStatus, TaskPriority, STATUS_CONFIG, PRIORITY_CONFIG } from "@/types";
import type { Task } from "@/types";
import { startOfWeek, addDays, format } from "date-fns";
import { uz } from "date-fns/locale";
import { formatDate, formatTime } from "@/lib/utils";

const COLORS = ["#6366F1", "#8B5CF6", "#10B981", "#F59E0B", "#EF4444", "#EC4899", "#06B6D4"];


export default function AnalyticsPage() {
  const { data: tasks = [], isLoading } = useTasks();
  const { data: streak } = useStreak();
  const theme = useThemeStore((s) => s.theme);
  const isDark = theme === "dark" || (theme === "system" && typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [exporting, setExporting] = useState<"json" | "csv" | "xlsx" | null>(null);

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (statusFilter !== "ALL" && t.status !== statusFilter) return false;
      if (priorityFilter !== "ALL" && t.priority !== priorityFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchTitle = t.title.toLowerCase().includes(q);
        const matchDesc = t.description?.toLowerCase().includes(q);
        const matchCat = t.category?.name?.toLowerCase().includes(q);
        const matchTag = t.tags?.some((tg) => tg.name.toLowerCase().includes(q));
        return matchTitle || matchDesc || matchCat || matchTag;
      }
      return true;
    });
  }, [tasks, statusFilter, priorityFilter, searchQuery]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === TaskStatus.COMPLETED).length;
    const inProgress = tasks.filter((t) => t.status === TaskStatus.IN_PROGRESS).length;
    const pending = tasks.filter((t) => t.status === TaskStatus.PENDING).length;
    const failed = tasks.filter((t) => t.status === TaskStatus.FAILED).length;
    const cancelled = tasks.filter((t) => t.status === TaskStatus.CANCELLED).length;
    const postponed = tasks.filter((t) => t.status === TaskStatus.POSTPONED).length;
    const overdue = tasks.filter((t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== TaskStatus.COMPLETED && t.status !== TaskStatus.CANCELLED).length;
    const withSubtasks = tasks.filter((t) => t.subtasks && t.subtasks.length > 0).length;
    const totalSubtasks = tasks.reduce((acc, t) => acc + (t.subtasks?.length || 0), 0);
    const completedSubtasks = tasks.reduce((acc, t) => acc + (t.subtasks?.filter((s) => s.completed).length || 0), 0);
    const totalTags = new Set(tasks.flatMap((t) => t.tags?.map((tg) => tg.name) || [])).size;
    const recurring = tasks.filter((t) => t.isRecurring).length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      total, completed, inProgress, pending, failed, cancelled, postponed,
      overdue, withSubtasks, totalSubtasks, completedSubtasks, totalTags, recurring, completionRate,
    };
  }, [tasks]);

  const weeklyData = useMemo(() => {
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => {
      const dayDate = addDays(weekStart, i);
      const dayKey = format(dayDate, "yyyy-MM-dd");
      const dayTasks = tasks.filter((t) => {
        if (!t.dueDate) return false;
        return format(new Date(t.dueDate), "yyyy-MM-dd") === dayKey;
      });
      return {
        day: format(dayDate, "EEEEEE", { locale: uz }),
        completed: dayTasks.filter((t) => t.status === TaskStatus.COMPLETED).length,
        total: dayTasks.length,
      };
    });
  }, [tasks]);

  const categoryData = useMemo(() => {
    const catMap = new Map<string, { count: number; color: string }>();
    tasks.forEach((t) => {
      const name = t.category?.name || "Boshqa";
      const color = t.category?.color || COLORS[catMap.size % COLORS.length];
      const existing = catMap.get(name) || { count: 0, color };
      existing.count++;
      catMap.set(name, existing);
    });
    return Array.from(catMap.entries()).map(([name, { count, color }], i) => ({
      name,
      value: count,
      color: color || COLORS[i % COLORS.length],
    }));
  }, [tasks]);



  const handleExport = async (format: "json" | "csv" | "xlsx") => {
    setExporting(format);
    try {
      const res = await fetch(`/api/export?format=${format}`);
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `reja-hisobot-${new Date().toISOString().slice(0, 10)}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // silent
    } finally {
      setExporting(null);
    }
  };

  const subTaskProgress = (task: Task) => {
    if (!task.subtasks?.length) return null;
    const done = task.subtasks.filter((s) => s.completed).length;
    return `${done}/${task.subtasks.length}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <LoaderCircle className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  const chartStroke = isDark ? "#334155" : "#E2E8F0";
  const chartText = isDark ? "#94A3B8" : "#64748B";

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Analitika va Hisobot</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Vazifalar statistikasi, tahlil va batafsil hisobot</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport("json")}
            disabled={exporting !== null}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all disabled:opacity-50"
          >
            {exporting === "json" ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <FileJson className="w-4 h-4" />}
            JSON
          </button>
          <button
            onClick={() => handleExport("csv")}
            disabled={exporting !== null}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all disabled:opacity-50"
          >
            {exporting === "csv" ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
            CSV
          </button>
          <button
            onClick={() => handleExport("xlsx")}
            disabled={exporting !== null}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold shadow-lg shadow-emerald-500/25 transition-all disabled:opacity-50"
          >
            {exporting === "xlsx" ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
            Excel
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {[
          { label: "Jami", value: stats.total, color: "bg-indigo-500" },
          { label: "Bajarildi", value: stats.completed, color: "bg-emerald-500" },
          { label: "Jarayonda", value: stats.inProgress, color: "bg-blue-500" },
          { label: "Kutilmoqda", value: stats.pending, color: "bg-amber-500" },
          { label: "Muddati o'tgan", value: stats.overdue, color: "bg-red-500" },
          { label: "Qilinmadi", value: stats.failed, color: "bg-rose-500" },
          { label: "Takrorlanuvchi", value: stats.recurring, color: "bg-violet-500" },
          { label: "Streak", value: `${streak?.currentStreak ?? 0}`, color: "bg-orange-500" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="card p-3 text-center"
          >
            <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
            <p className={`text-xl font-bold mt-0.5 ${stat.color.replace("bg-", "text-")}`}>{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-4">
          <h3 className="font-semibold text-gray-900 dark:text-gray-50 mb-4">Haftalik bajarilish</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartStroke} />
                <XAxis dataKey="day" stroke={chartText} fontSize={11} />
                <YAxis stroke={chartText} fontSize={11} />
                <Tooltip />
                <Bar dataKey="total" fill={chartStroke} radius={[3, 3, 0, 0]} />
                <Bar dataKey="completed" fill="#6366F1" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card p-4">
          <h3 className="font-semibold text-gray-900 dark:text-gray-50 mb-4">Kategoriya bo'yicha</h3>
          <div className="h-48 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPie>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={3} dataKey="value">
                  {categoryData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPie>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-gray-50">Batafsil hisobot</h3>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Qidirish..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-40 h-9 pl-9 pr-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 px-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="ALL">Barcha status</option>
              {Object.values(TaskStatus).map((s) => (
                <option key={s} value={s}>{STATUS_CONFIG[s as TaskStatus]?.label || s}</option>
              ))}
            </select>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="h-9 px-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="ALL">Barcha ustuvorlik</option>
              {Object.values(TaskPriority).map((p) => (
                <option key={p} value={p}>{PRIORITY_CONFIG[p as TaskPriority]?.label || p}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          {filteredTasks.length === 0 && (
            <div className="text-center py-12">
              <ListTodo className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Vazifalar topilmadi</p>
            </div>
          )}

          {filteredTasks.map((task, i) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              className="border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
                className="w-full flex items-center gap-3 p-3.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left"
              >
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  task.status === TaskStatus.COMPLETED ? "bg-emerald-500" :
                  task.status === TaskStatus.IN_PROGRESS ? "bg-blue-500" :
                  task.status === TaskStatus.FAILED ? "bg-red-500" :
                  task.status === TaskStatus.CANCELLED ? "bg-gray-400" :
                  task.status === TaskStatus.POSTPONED ? "bg-orange-500" :
                  "bg-amber-500"
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{task.title}</p>
                    {task.isRecurring && <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 font-medium">Takroriy</span>}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                      task.priority === TaskPriority.URGENT ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400" :
                      task.priority === TaskPriority.HIGH ? "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400" :
                      task.priority === TaskPriority.MEDIUM ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" :
                      "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                    }`}>
                      {PRIORITY_CONFIG[task.priority as TaskPriority]?.label || task.priority}
                    </span>
                    <span className="text-[10px] text-gray-400">{STATUS_CONFIG[task.status as TaskStatus]?.label || task.status}</span>
                    {task.category && (
                      <span className="text-[10px] text-gray-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: task.category.color }} />
                        {task.category.name}
                      </span>
                    )}
                    {task.dueDate && (
                      <span className="text-[10px] text-gray-400">
                        {formatDate(task.dueDate)}
                        {task.dueTime && ` ${formatTime(task.dueTime)}`}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  {task.subtasks && task.subtasks.length > 0 && (
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      {subTaskProgress(task)}
                    </span>
                  )}
                  {task.tags && task.tags.length > 0 && (
                    <span className="flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      {task.tags.length}
                    </span>
                  )}
                  {expandedTask === task.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              <AnimatePresence>
                {expandedTask === task.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-3.5 pb-3.5 pt-0 border-t border-gray-100 dark:border-gray-800">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                        <div className="space-y-3">
                          {task.description && (
                            <div>
                              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Tavsif</p>
                              <p className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{task.description}</p>
                            </div>
                          )}

                          {task.subtasks && task.subtasks.length > 0 && (
                            <div>
                              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                                Sub-vazifalar ({subTaskProgress(task)})
                              </p>
                              <div className="space-y-1">
                                {task.subtasks.map((st, j) => (
                                  <div key={j} className="flex items-center gap-2">
                                    {st.completed ? (
                                      <CheckCircle2 className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                                    ) : (
                                      <Circle className="w-3 h-3 text-gray-300 dark:text-gray-600 flex-shrink-0" />
                                    )}
                                    <span className="text-xs text-gray-700 dark:text-gray-300">{st.title}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {task.tags && task.tags.length > 0 && (
                            <div>
                              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Teglar</p>
                              <div className="flex flex-wrap gap-1.5">
                                {task.tags.map((tg, j) => (
                                  <span
                                    key={j}
                                    className="text-[10px] px-2 py-0.5 rounded-full"
                                    style={{
                                      backgroundColor: tg.color ? `${tg.color}20` : "#6366F120",
                                      color: tg.color || "#6366F1",
                                    }}
                                  >
                                    {tg.name}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="space-y-3">
                          <div>
                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Vaqt ma'lumotlari</p>
                            <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                              <p>Yaratilgan: {formatDate(task.createdAt)}{task.createdAt && ` ${formatTime(task.createdAt)}`}</p>
                              {task.updatedAt && <p>Yangilangan: {formatDate(task.updatedAt)}{` ${formatTime(task.updatedAt)}`}</p>}
                              {task.completedAt && <p>Bajarilgan: {formatDate(task.completedAt)}{` ${formatTime(task.completedAt)}`}</p>}
                              {task.archivedAt && <p>Arxivlangan: {formatDate(task.archivedAt)}{` ${formatTime(task.archivedAt)}`}</p>}
                            </div>
                          </div>

                          {task.reminders && task.reminders.length > 0 && (
                            <div>
                              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Eslatmalar</p>
                              <div className="space-y-1">
                                {task.reminders.map((rm, j) => (
                                  <div key={j} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                                    <Bell className="w-3 h-3 text-gray-400" />
                                    <span>{formatDate(rm.remindAt)} {formatTime(rm.remindAt)}</span>
                                    <span className={`text-[10px] px-1 py-0.5 rounded ${rm.sent ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600" : "bg-gray-100 dark:bg-gray-800 text-gray-500"}`}>
                                      {rm.sent ? "Yuborilgan" : "Kutilmoqda"}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {task.attachments && task.attachments.length > 0 && (
                            <div>
                              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Fayllar ({task.attachments.length})</p>
                              <div className="space-y-1">
                                {task.attachments.map((att, j) => (
                                  <div key={j} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                                    <Paperclip className="w-3 h-3 text-gray-400" />
                                    <span className="truncate">{att.name}</span>
                                    <span className="text-gray-400">({Math.round(att.size / 1024)}KB)</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-400">
          <span>{filteredTasks.length} / {tasks.length} ta vazifa</span>
          <span>
            {stats.totalSubtasks > 0 && `${stats.completedSubtasks}/${stats.totalSubtasks} sub-vazifa bajarilgan`}
          </span>
        </div>
      </motion.div>
    </div>
  );
}