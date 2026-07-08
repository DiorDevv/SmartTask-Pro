"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import {
  X,
  Calendar,
  Clock,
  Tag,
  Flag,
  ListPlus,
  AlignLeft,
  Type,
  LoaderCircle,
  AlertCircle,
  CheckCircle2,
  Circle,
  Trash2,
} from "lucide-react";
import { TaskPriority } from "@/types";

interface TaskModalProps {
  onClose: () => void;
  onSuccess?: () => void;
  task?: {
    id: string;
    title?: string | null;
    description?: string | null;
    priority?: TaskPriority | null;
    dueDate?: string | Date | null;
    dueTime?: string | Date | null;
    category?: string | { name: string; id?: string } | null;
    isRecurring?: boolean | null;
    recurrence?: string | null;
  };
}

function toDateStr(date: string | Date | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().split("T")[0];
}

function toTimeStr(date: string | Date | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  return d.toTimeString().slice(0, 5);
}

export function TaskModal({ onClose, onSuccess, task }: TaskModalProps) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [priority, setPriority] = useState<TaskPriority>(task?.priority || TaskPriority.MEDIUM);
  const [dueDate, setDueDate] = useState(toDateStr(task?.dueDate));
  const [dueTime, setDueTime] = useState(toTimeStr(task?.dueTime));
  const [category, setCategory] = useState(() => {
    if (!task?.category) return "ish";
    if (typeof task.category === "string") return task.category;
    return (task.category as { name?: string })?.name || "ish";
  });
  const [isRecurring, setIsRecurring] = useState(task?.isRecurring || false);
  const [recurrence, setRecurrence] = useState(task?.recurrence || "daily");
  const [subtasks, setSubtasks] = useState<{ title: string; completed: boolean }[]>([]);
  const [subtaskInput, setSubtaskInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    setError("");
    const isEditing = !!task?.id;
    try {
      const res = await fetch(isEditing ? `/api/tasks/${task.id}` : "/api/tasks", {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          priority,
          dueDate: dueDate || null,
          dueTime: dueTime || null,
          category: category || null,
          isRecurring,
          recurrence: isRecurring ? recurrence : null,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Xatolik yuz berdi");
      }
      const savedTask = await res.json();
      for (const st of subtasks) {
        await fetch(`/api/tasks/${savedTask.id}/subtasks`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: st.title }),
        });
      }
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-start justify-center p-4 pt-[10vh]"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", duration: 0.4, bounce: 0.3 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-modal border border-gray-100 dark:border-gray-800 overflow-hidden"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-50">
              {task ? "Vazifani tahrirlash" : "Yangi vazifa"}
            </h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-all"
            >
              <X className="w-5 h-5" />
            </motion.button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <Type className="w-3.5 h-3.5" />
                Sarlavha
              </label>
              <input
                type="text"
                placeholder="Vazifa sarlavhasi..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                autoFocus
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <AlignLeft className="w-3.5 h-3.5" />
                Tavsif
              </label>
              <textarea
                placeholder="Batafsil tavsif (ixtiyoriy)..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none min-h-[90px]"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <Calendar className="w-3.5 h-3.5" />
                  Muddat
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <Clock className="w-3.5 h-3.5" />
                  Vaqt
                </label>
                <input
                  type="time"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <Flag className="w-3.5 h-3.5" />
                  Ustuvorlik
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TaskPriority)}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                >
                  <option value="LOW">Past</option>
                  <option value="MEDIUM">O'rta</option>
                  <option value="HIGH">Yuqori</option>
                  <option value="URGENT">Favqulodda</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <Tag className="w-3.5 h-3.5" />
                  Kategoriya
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                >
                  <option value="ish">Ish</option>
                  <option value="shaxsiy">Shaxsiy</option>
                  <option value="oqish">O'qish</option>
                  <option value="sport">Sport</option>
                  <option value="salomatlik">Salomatlik</option>
                  <option value="moliya">Moliya</option>
                  <option value="boshqa">Boshqa</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" checked={isRecurring} onChange={(e) => setIsRecurring(e.target.checked)} className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-indigo-500 focus:ring-indigo-500/20" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Takrorlanuvchi</span>
              </label>
              {isRecurring && (
                <select value={recurrence} onChange={(e) => setRecurrence(e.target.value)} className="px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                  <option value="daily">Har kuni</option>
                  <option value="weekly">Har hafta</option>
                  <option value="monthly">Har oy</option>
                </select>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Sub-vazifa nomi..."
                  value={subtaskInput}
                  onChange={(e) => setSubtaskInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && subtaskInput.trim()) {
                      e.preventDefault();
                      setSubtasks((prev) => [...prev, { title: subtaskInput.trim(), completed: false }]);
                      setSubtaskInput("");
                    }
                  }}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  onClick={() => {
                    if (subtaskInput.trim()) {
                      setSubtasks((prev) => [...prev, { title: subtaskInput.trim(), completed: false }]);
                      setSubtaskInput("");
                    }
                  }}
                  className="p-2.5 rounded-xl bg-indigo-500 text-white hover:bg-indigo-600 transition-all"
                >
                  <ListPlus className="w-4 h-4" />
                </motion.button>
              </div>
              {subtasks.length > 0 && (
                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                  {subtasks.map((st, idx) => (
                    <div key={idx} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800/30 group">
                      {st.completed ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                      ) : (
                        <Circle className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600 flex-shrink-0" />
                      )}
                      <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">{st.title}</span>
                      <button
                        type="button"
                        onClick={() => setSubtasks((prev) => prev.filter((_, i) => i !== idx))}
                        className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {error && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all disabled:opacity-50"
              >
                Bekor qilish
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center gap-2"><LoaderCircle className="w-4 h-4 animate-spin" />Yuklanmoqda...</span>
                ) : (
                  task ? "Saqlash" : "Qo'shish"
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
