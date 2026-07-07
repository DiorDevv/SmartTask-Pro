"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Search,
  SlidersHorizontal,
  Grid3X3,
  List,
  ChevronDown,
  Plus,
  FolderKanban,
} from "lucide-react";
import { TaskCard } from "@/components/tasks/task-card";
import { TaskModal } from "@/components/tasks/task-modal";
import { Task, TaskStatus } from "@/types";

const statusFilters = [
  { value: "ALL", label: "Barcha holatlar" },
  { value: "PENDING", label: "Bajarilmagan", color: "bg-yellow-500" },
  { value: "IN_PROGRESS", label: "Bajarilmoqda", color: "bg-blue-500" },
  { value: "COMPLETED", label: "Bajarildi", color: "bg-emerald-500" },
  { value: "FAILED", label: "Qilinmadi", color: "bg-red-500" },
  { value: "POSTPONED", label: "Kechiktirildi", color: "bg-orange-500" },
  { value: "CANCELLED", label: "Bekor qilindi", color: "bg-gray-500" },
];

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showNewTask, setShowNewTask] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch("/api/tasks");
      if (res.ok) setTasks(await res.json());
    } catch {}
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

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

  const filteredTasks = tasks
    .filter((t) => filterStatus === "ALL" || t.status === filterStatus)
    .filter((t) => t.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Vazifalar</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Barcha vazifalaringizni boshqaring</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-1 shadow-sm">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-indigo-500 text-white shadow-sm" : "text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"}`}
            >
              <List className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-indigo-500 text-white shadow-sm" : "text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"}`}
            >
              <Grid3X3 className="w-4 h-4" />
            </motion.button>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowNewTask(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all"
          >
            <Plus className="w-4 h-4" />
            Yangi Vazifa
          </motion.button>
        </div>
      </motion.div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Vazifalarni qidirish..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>
        <div className="relative">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="appearance-none h-10 pl-4 pr-10 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
          >
            {statusFilters.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 h-10 px-4 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filtrlar
        </motion.button>
      </div>

      {filteredTasks.length === 0 && tasks.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-24"
        >
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-900/30 dark:to-violet-900/30 flex items-center justify-center mb-5 shadow-lg">
            <FolderKanban className="w-10 h-10 text-indigo-500 dark:text-indigo-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-50 mb-1">Vazifalar topilmadi</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Hali hech qanday vazifa qo'shilmagan</p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowNewTask(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all"
          >
            <Plus className="w-4 h-4" />
            Birinchi vazifani qo'shish
          </motion.button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3"
              : "space-y-3"
          }
        >
          {filteredTasks.map((task, i) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <TaskCard
                task={task}
                onStatusChange={handleStatusChange}
                onEdit={setEditingTask}
                onDelete={handleDelete}
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      {showNewTask && <TaskModal onClose={() => setShowNewTask(false)} onSuccess={fetchTasks} />}
      {editingTask && <TaskModal task={editingTask} onClose={() => setEditingTask(null)} onSuccess={fetchTasks} />}
    </div>
  );
}
