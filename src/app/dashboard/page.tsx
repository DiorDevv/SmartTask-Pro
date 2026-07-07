"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  ListTodo,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Flame,
  Target,
  Layers,
  Sparkles,
} from "lucide-react";
import { StatsCard } from "@/components/dashboard/stats-card";
import { ProgressBar } from "@/components/dashboard/progress-bar";
import { TaskCard } from "@/components/tasks/task-card";
import { TaskModal } from "@/components/tasks/task-modal";
import { Task, TaskStatus } from "@/types";
import { formatDateFull } from "@/lib/utils";

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showNewTask, setShowNewTask] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch("/api/tasks");
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch {}
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const today = new Date();
  const dateStr = formatDateFull(today);

  const completedCount = tasks.filter((t) => t.status === TaskStatus.COMPLETED).length;
  const inProgressCount = tasks.filter((t) => t.status === TaskStatus.IN_PROGRESS).length;
  const pendingCount = tasks.filter((t) => t.status === TaskStatus.PENDING).length;
  const failedCount = tasks.filter((t) => t.status === TaskStatus.FAILED).length;
  const totalActive = tasks.filter((t) => t.status !== TaskStatus.CANCELLED).length;
  const progress = totalActive > 0 ? Math.round((completedCount / totalActive) * 100) : 0;

  const handleStatusChange = async (id: string, status: TaskStatus) => {
    try {
      await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
    } catch {}
  };
  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch {}
  };

  const greeting = () => {
    const h = today.getHours();
    if (h < 12) return "Xayrli tong";
    if (h < 18) return "Xayrli kun";
    return "Xayrli kech";
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-indigo-500 dark:text-indigo-400 mb-1">
            <Sparkles className="w-4 h-4" />
            <span>{greeting()}</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50 capitalize leading-tight">{dateStr}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Kunlik vazifalaringizni kuzatib boring</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowNewTask(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all"
        >
          <Plus className="w-4 h-4" />
          Yangi Vazifa
        </motion.button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <StatsCard title="Bajarildi" value={completedCount} icon={CheckCircle2} gradient="bg-gradient-to-br from-emerald-500 to-green-600" trend={{ value: 12, positive: true }} />
        <StatsCard title="Bajarilmoqda" value={inProgressCount} icon={Clock} gradient="bg-gradient-to-br from-blue-500 to-indigo-600" />
        <StatsCard title="Kutilmoqda" value={pendingCount} icon={ListTodo} gradient="bg-gradient-to-br from-amber-500 to-orange-600" />
        <StatsCard title="Qilinmadi" value={failedCount} icon={AlertTriangle} gradient="bg-gradient-to-br from-red-500 to-rose-600" trend={{ value: 8, positive: false }} />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-50">Bugungi Vazifalar</h2>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100/50 dark:bg-gray-800/50 text-sm">
              <span className="text-gray-500 dark:text-gray-400">Bajarilgan:</span>
              <span className="font-bold text-gray-900 dark:text-gray-50">{completedCount}/{totalActive}</span>
            </div>
          </div>

          <div className="space-y-3">
            {tasks
              .filter((t) => t.status !== TaskStatus.CANCELLED)
              .sort((a, b) => {
                const order = [TaskStatus.IN_PROGRESS, TaskStatus.PENDING, TaskStatus.POSTPONED, TaskStatus.COMPLETED, TaskStatus.FAILED];
                return order.indexOf(a.status) - order.indexOf(b.status);
              })
              .map((task, i) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                >
                  <TaskCard
                    task={task}
                    onStatusChange={handleStatusChange}
                    onEdit={setEditingTask}
                    onDelete={handleDelete}
                  />
                </motion.div>
              ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="space-y-4"
        >
          <div className="card p-5">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                <Target className="w-[18px] h-[18px] text-white" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-gray-50">Kunlik Progress</h3>
            </div>
            <ProgressBar value={progress} label="Umumiy bajarilish" size="lg" />
            <div className="grid grid-cols-2 gap-3 mt-5">
              <div className="text-center p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/30">
                <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{completedCount}</p>
                <p className="text-xs font-medium text-emerald-600/70 dark:text-emerald-400/70 mt-0.5">Bajarildi</p>
              </div>
              <div className="text-center p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/30">
                <p className="text-3xl font-black text-amber-600 dark:text-amber-400">{pendingCount}</p>
                <p className="text-xs font-medium text-amber-600/70 dark:text-amber-400/70 mt-0.5">Kutilmoqda</p>
              </div>
            </div>
          </div>

          <div className="card p-5">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-rose-600 flex items-center justify-center">
                <Flame className="w-[18px] h-[18px] text-white" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-gray-50">Streak</h3>
            </div>
            <div className="text-center py-2">
              <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-rose-600">12</p>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">ketma-ket kun</p>
            </div>
            <div className="flex items-center justify-center gap-1.5 mt-4">
              {Array.from({ length: 7 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 + i * 0.05 }}
                  className={`w-9 h-9 rounded-lg ${
                    i < 5 ? "bg-emerald-500 shadow-sm shadow-emerald-500/30" :
                    i === 5 ? "bg-amber-500 shadow-sm shadow-amber-500/30" :
                    "bg-gray-200 dark:bg-gray-700"
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="card p-5">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <Layers className="w-[18px] h-[18px] text-white" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-gray-50">Kategoriyalar</h3>
            </div>
            <div className="space-y-3">
              {[
                { name: "Ish", color: "bg-indigo-500", count: 3 },
                { name: "Shaxsiy", color: "bg-violet-500", count: 1 },
                { name: "Sport", color: "bg-emerald-500", count: 1 },
              ].map((cat) => (
                <div key={cat.name} className="flex items-center justify-between py-1.5">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-3 h-3 rounded-full ${cat.color}`} />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{cat.name}</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900 dark:text-gray-50">{cat.count}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {showNewTask && <TaskModal onClose={() => setShowNewTask(false)} onSuccess={fetchTasks} />}
      {editingTask && <TaskModal task={editingTask} onClose={() => setEditingTask(null)} onSuccess={fetchTasks} />}
    </div>
  );
}
