"use client";

import { motion } from "framer-motion";
import { format, isToday, isPast } from "date-fns";
import {
  Clock, Flag, CheckCircle2, Circle, Edit3, Trash2, Calendar,
} from "lucide-react";
import { TaskStatus } from "@/types";
import type { Task } from "@/types";
import { uz } from "date-fns/locale";
import {
  PRIORITY_DOTS, PRIORITY_LABELS, STATUS_LABELS, formatTime,
} from "@/lib/calendar-utils";

interface AgendaViewProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onToggleTask: (id: string) => void;
}

export function AgendaView({ tasks, onEditTask, onDeleteTask, onToggleTask }: AgendaViewProps) {
  const grouped: Record<string, Task[]> = {};
  const sorted = [...tasks]
    .filter((t) => t.dueDate)
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());

  sorted.forEach((task) => {
    const key = format(new Date(task.dueDate!), "yyyy-MM-dd");
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(task);
  });

  if (Object.keys(grouped).length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="card p-12 text-center"
      >
        <Calendar className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
        <p className="text-gray-500 dark:text-gray-400">Vazifalar topilmadi</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {Object.entries(grouped).map(([dateKey, dateTasks]) => {
        const d = new Date(dateKey + "T00:00:00");
        const isTodayDate = isToday(d);
        const isPastDate = isPast(d) && !isTodayDate;

        return (
          <div key={dateKey}>
            <div className="flex items-center gap-3 mb-3">
              <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                isTodayDate
                  ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300"
                  : isPastDate
                  ? "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                  : "bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300"
              }`}>
                {isTodayDate ? "Bugun" : format(d, "d MMMM", { locale: uz })}
              </div>
              <div className="flex-1 border-t border-gray-100 dark:border-gray-800" />
              <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">{dateTasks.length} ta</span>
            </div>
            <div className="space-y-1.5">
              {dateTasks.map((task) => (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="card p-3 card-hover flex items-start gap-3 group"
                >
                  <button
                    onClick={() => onToggleTask(task.id)}
                    className="mt-0.5 flex-shrink-0"
                    aria-label={task.status === TaskStatus.COMPLETED ? "Ochish" : "Bajarildi"}
                  >
                    {task.status === TaskStatus.COMPLETED ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-300 dark:text-gray-600 group-hover:text-indigo-400 transition-colors" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${PRIORITY_DOTS[task.priority] || "bg-gray-400"}`} />
                      <p className={`text-sm font-semibold truncate ${
                        task.status === TaskStatus.COMPLETED
                          ? "line-through text-gray-400 dark:text-gray-500"
                          : "text-gray-900 dark:text-gray-100"
                      }`}>
                        {task.title}
                      </p>
                    </div>
                    {task.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">{task.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      {task.dueTime && (
                        <span className="flex items-center gap-1 text-[11px] text-gray-400">
                          <Clock className="w-3 h-3" />
                          {formatTime(task.dueTime)}
                        </span>
                      )}
                      <span className={`text-[11px] font-medium ${
                        task.priority === "URGENT" ? "text-red-500" :
                        task.priority === "HIGH" ? "text-orange-500" :
                        task.priority === "MEDIUM" ? "text-blue-500" : "text-gray-400"
                      }`}>
                        <Flag className="w-3 h-3 inline mr-0.5" />
                        {PRIORITY_LABELS[task.priority]}
                      </span>
                      <span className="text-[11px] text-gray-400 dark:text-gray-500">
                        {STATUS_LABELS[task.status] || task.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <button onClick={() => onEditTask(task)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400">
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => onDeleteTask(task.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        );
      })}
    </motion.div>
  );
}
