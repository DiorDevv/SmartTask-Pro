"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  Flame,
  Download,
  Calendar,
  ArrowUp,
  LoaderCircle,
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
  AreaChart,
  Area,
} from "recharts";
import { ProgressBar } from "@/components/dashboard/progress-bar";
import { useTasks } from "@/hooks/use-tasks";
import { useStreak } from "@/hooks/use-streak";
import { useThemeStore } from "@/store/theme-store";
import { TaskStatus, TaskPriority } from "@/types";
import { startOfWeek, addDays, format } from "date-fns";
import { uz } from "date-fns/locale";

const COLORS = ["#6366F1", "#8B5CF6", "#10B981", "#F59E0B", "#EF4444", "#EC4899", "#06B6D4"];

export default function AnalyticsPage() {
  const { data: tasks = [], isLoading } = useTasks();
  const { data: streak } = useStreak();
  const theme = useThemeStore((s) => s.theme);
  const calcDark = (t: string) =>
    t === "dark" || (t === "system" && typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  const [isDark, setIsDark] = useState(calcDark(theme));
  useEffect(() => {
    setIsDark(calcDark(theme));
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const check = () => setIsDark(calcDark(theme));
    mq.addEventListener("change", check);
    return () => mq.removeEventListener("change", check);
  }, [theme]);
  const chartStroke = isDark ? "#334155" : "#E2E8F0";
  const chartText = isDark ? "#94A3B8" : "#64748B";

  const { totalTasks, completedCount, completionRate, weeklyData, categoryData, monthlyTrend, heatmapData } = useMemo(() => {
    const tt = tasks.length;
    const cc = tasks.filter((t) => t.status === TaskStatus.COMPLETED).length;
    const cr = tt > 0 ? Math.round((cc / tt) * 100) : 0;

    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    const wd = Array.from({ length: 7 }, (_, i) => {
      const dayDate = addDays(weekStart, i);
      const dayKey = format(dayDate, "yyyy-MM-dd");
      const dayTasks = tasks.filter((t) => {
        if (!t.dueDate) return false;
        const d = format(new Date(t.dueDate), "yyyy-MM-dd");
        return d === dayKey;
      });
      return {
        day: format(dayDate, "EEEEEE", { locale: uz }),
        completed: dayTasks.filter((t) => t.status === TaskStatus.COMPLETED).length,
        total: dayTasks.length,
      };
    });

    const catMap = new Map<string, number>();
    tasks.forEach((t) => {
      const name = t.category?.name || "Boshqa";
      catMap.set(name, (catMap.get(name) || 0) + 1);
    });
    const cd = tt > 0 ? Array.from(catMap.entries()).map(([name, value], i) => ({
      name,
      value,
      color: COLORS[i % COLORS.length],
    })) : [];

    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);
    const mt = Array.from({ length: 7 }, (_, i) => {
      const m = new Date(sixMonthsAgo.getFullYear(), sixMonthsAgo.getMonth() + i, 1);
      const monthKey = format(m, "yyyy-MM");
      const monthTasks = tasks.filter((t) => {
        if (!t.dueDate) return false;
        return format(new Date(t.dueDate), "yyyy-MM") === monthKey;
      });
      return {
        month: format(m, "MMM", { locale: uz }),
        tasks: monthTasks.length,
        completed: monthTasks.filter((t) => t.status === TaskStatus.COMPLETED).length,
      };
    });

    const hm = Array.from({ length: 7 }, (_, dayOffset) => {
      const date = addDays(weekStart, dayOffset);
      const dateKey = format(date, "yyyy-MM-dd");
      return Array.from({ length: 24 }, () =>
        tasks.filter((t) => {
          if (!t.dueDate) return false;
          return format(new Date(t.dueDate), "yyyy-MM-dd") === dateKey;
        }).length
      );
    });

    return { totalTasks: tt, completedCount: cc, completionRate: cr, weeklyData: wd, categoryData: cd, monthlyTrend: mt, heatmapData: hm };
  }, [tasks]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-3">
          <LoaderCircle className="w-8 h-8 animate-spin text-indigo-500" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text dark:text-text-dark">Analitika</h1>
          <p className="text-muted text-sm mt-1">Vazifalar statistikasi va tahlillar</p>
        </div>
        <button className="btn-secondary btn-md" onClick={() => {
          const csv = [
            ["Ko'rsatkich", "Qiymat"],
            ["Jami vazifalar", totalTasks],
            ["Bajarilgan", completedCount],
            ["Bajarilish darajasi", `${completionRate}%`],
            ["Haftalik", ...weeklyData.map(d => `${d.day}: ${d.completed}/${d.total}`)],
          ].map((r) => r.join(",")).join("\n");
          const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `reja-hisobot-${new Date().toISOString().slice(0, 10)}.csv`;
          a.click();
          URL.revokeObjectURL(url);
        }}>
          <Download className="w-4 h-4" />
          Hisobot
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "O'rtacha bajarilish", value: `${completionRate}%`, icon: TrendingUp, color: "bg-success", trend: "+5%" },
          { title: "Jami vazifalar", value: `${totalTasks}`, icon: BarChart3, color: "bg-primary", trend: "+12%" },
          { title: "Eng yaxshi kun", value: "Payshanba", icon: Calendar, color: "bg-secondary" },
          { title: "Streak", value: `${streak?.currentStreak ?? 0} kun`, icon: Flame, color: "bg-orange-500", trend: "+3" },
        ].map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="card p-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted">{stat.title}</p>
                <p className="text-2xl font-bold text-text dark:text-text-dark mt-1">{stat.value}</p>
                {stat.trend && (
                  <p className="text-xs text-success mt-1">{stat.trend}</p>
                )}
              </div>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-4"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-text dark:text-text-dark">Haftalik bajarilish</h3>
            <div className="flex items-center gap-2 text-xs text-muted">
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 rounded bg-primary" />
                <span>Bajarildi</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 rounded bg-gray-200 dark:bg-gray-700" />
                <span>Jami</span>
              </div>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartStroke} />
                <XAxis dataKey="day" stroke={chartText} fontSize={12} />
                <YAxis stroke={chartText} fontSize={12} />
                <Tooltip />
                <Bar dataKey="total" fill={chartStroke} radius={[4, 4, 0, 0]} />
                <Bar dataKey="completed" fill="#6366F1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-4"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-text dark:text-text-dark">Oylik trend</h3>
            <div className="flex items-center gap-1 text-success text-xs">
              <ArrowUp className="w-3 h-3" />
              <span>+12%</span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartStroke} />
                <XAxis dataKey="month" stroke={chartText} fontSize={12} />
                <YAxis stroke={chartText} fontSize={12} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="tasks"
                  stroke="#8B5CF6"
                  fill="#8B5CF6"
                  fillOpacity={0.1}
                />
                <Area
                  type="monotone"
                  dataKey="completed"
                  stroke="#10B981"
                  fill="#10B981"
                  fillOpacity={0.1}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card p-4"
        >
          <h3 className="font-semibold text-text dark:text-text-dark mb-4">Kategoriya bo'yicha</h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPie>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPie>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-3 mt-2">
            {categoryData.map((cat) => (
              <div key={cat.name} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                <span className="text-xs text-muted">{cat.name}</span>
                <span className="text-xs font-medium">{cat.value} ta</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card p-4"
        >
          <h3 className="font-semibold text-text dark:text-text-dark mb-4">Faollik xaritasi</h3>
          <div className="grid grid-cols-24 gap-1">
            {heatmapData.map((row, i) => (
              <div key={i} className="flex gap-1">
                {row.map((val, j) => (
                  <div
                    key={j}
                    className="w-3 h-3 rounded-sm"
                    style={{
                      backgroundColor:
                        val === 0
                          ? "#F1F5F9"
                          : val === 1
                          ? "#C7D2FE"
                          : val === 2
                          ? "#A5B4FC"
                          : val === 3
                          ? "#818CF8"
                          : "#6366F1",
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-3">
            <span className="text-xs text-muted">Kam</span>
            {[0, 1, 2, 3, 4].map((v) => (
              <div
                key={v}
                className="w-3 h-3 rounded-sm"
                style={{
                  backgroundColor:
                    v === 0
                      ? "#F1F5F9"
                      : v === 1
                      ? "#C7D2FE"
                      : v === 2
                      ? "#A5B4FC"
                      : v === 3
                      ? "#818CF8"
                      : "#6366F1",
                }}
              />
            ))}
            <span className="text-xs text-muted">Ko'p</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
