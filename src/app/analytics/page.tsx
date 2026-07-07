"use client";

import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  Flame,
  Download,
  Calendar,
  ArrowUp,
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

const weeklyData = [
  { day: "Du", completed: 5, total: 8 },
  { day: "Se", completed: 7, total: 9 },
  { day: "Ch", completed: 3, total: 7 },
  { day: "Pa", completed: 8, total: 10 },
  { day: "Ju", completed: 6, total: 8 },
  { day: "Sh", completed: 4, total: 5 },
  { day: "Ya", completed: 2, total: 4 },
];

const monthlyTrend = [
  { month: "Yan", tasks: 45, completed: 32 },
  { month: "Fev", tasks: 52, completed: 40 },
  { month: "Mar", tasks: 48, completed: 36 },
  { month: "Apr", tasks: 60, completed: 48 },
  { month: "May", tasks: 55, completed: 42 },
  { month: "Iyun", tasks: 58, completed: 45 },
  { month: "Iyul", tasks: 35, completed: 28 },
];

const categoryData = [
  { name: "Ish", value: 45, color: "#6366F1" },
  { name: "Shaxsiy", value: 20, color: "#8B5CF6" },
  { name: "O'qish", value: 15, color: "#10B981" },
  { name: "Sport", value: 12, color: "#F59E0B" },
  { name: "Salomatlik", value: 8, color: "#EF4444" },
];

const heatmapData = Array.from({ length: 7 }, () =>
  Array.from({ length: 24 }, () => Math.floor(Math.random() * 5))
);

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text dark:text-text-dark">Analitika</h1>
          <p className="text-muted text-sm mt-1">Vazifalar statistikasi va tahlillar</p>
        </div>
        <button className="btn-secondary btn-md">
          <Download className="w-4 h-4" />
          Hisobot
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "O'rtacha bajarilish", value: "78%", icon: TrendingUp, color: "bg-success", trend: "+5%" },
          { title: "Jami vazifalar", value: "353", icon: BarChart3, color: "bg-primary", trend: "+12%" },
          { title: "Eng yaxshi kun", value: "Payshanba", icon: Calendar, color: "bg-secondary" },
          { title: "Streak", value: "12 kun", icon: Flame, color: "bg-orange-500", trend: "+3" },
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
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="day" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip />
                <Bar dataKey="total" fill="#E2E8F0" radius={[4, 4, 0, 0]} />
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
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
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
                <span className="text-xs font-medium">{cat.value}%</span>
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
