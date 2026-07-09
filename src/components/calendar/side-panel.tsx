"use client";

import { motion } from "framer-motion";
import {
  Calendar as CalendarIcon, ListTodo, Clock,
  CheckCircle2, Circle, Trash2, Edit3,
} from "lucide-react";
import { format, addDays, startOfWeek } from "date-fns";
import { TaskStatus } from "@/types";
import type { Task } from "@/types";
import {
  formatDate, PRIORITY_DOTS, PRIORITY_LABELS, STATUS_LABELS, isOverdue, formatTime,
} from "@/lib/calendar-utils";

interface SidePanelProps {
  selectedDate: Date;
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onToggleTask: (id: string) => void;
  onSelectDate: (date: Date) => void;
}

export function SidePanel({
  selectedDate, tasks, onEditTask, onDeleteTask, onToggleTask, onSelectDate,
}: SidePanelProps) {
  const dateKey = format(selectedDate, "yyyy-MM-dd");
  const dayEvents = tasks.filter((t) => {
    if (!t.dueDate) return false;
    return format(new Date(t.dueDate), "yyyy-MM-dd") === dateKey;
  });

  const today = new Date();
  const tomorrow = addDays(today, 1);
  const weekEnd = addDays(startOfWeek(today, { weekStartsOn: 1 }), 6);

  const filters = [
    { label: "Bugun", date: today, color: "bg-indigo-500", icon: Circle },
    { label: "Ertaga", date: tomorrow, color: "bg-blue-500", icon: Circle },
    { label: "Shu hafta", date: weekEnd, color: "bg-emerald-500", icon: Circle },
  ];

  const isFilterActive = (filterDate: Date) =>
    format(filterDate, "yyyy-MM-dd") === dateKey;

  return (
    <div className="space-y-4">
      <motion.div
        key={dateKey}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-4"
      >
        <div className="flex items-center gap-2 mb-4">
          <CalendarIcon className="w-5 h-5 text-indigo-500" />
          <h3 className="font-semibold text-gray-900 dark:text-gray-50 text-sm">
            {formatDate(selectedDate)}
          </h3>
        </div>

        {dayEvents.length > 0 ? (
          <div className="space-y-1.5">
            {dayEvents.map((task) => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="group flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all"
              >
                <button
                  onClick={() => onToggleTask(task.id)}
                  className="mt-0.5 flex-shrink-0 transition-all"
aria-label={task.status === TaskStatus.COMPLETED ? "Ochish" : "Bajarildi"}
                  >
                    {task.status === TaskStatus.COMPLETED ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Circle className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-indigo-400 transition-colors" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${PRIORITY_DOTS[task.priority] || "bg-gray-400"}`} />
                    <p className={`text-sm font-medium truncate ${
                      task.status === TaskStatus.COMPLETED
                        ? "line-through text-gray-400 dark:text-gray-500"
                        : "text-gray-900 dark:text-gray-100"
                    }`}>
                      {task.title}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {task.dueTime && (
                      <span className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500">
                        <Clock className="w-3 h-3" />
                        {formatTime(task.dueTime)}
                      </span>
                    )}
                    <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded ${
                      task.status === TaskStatus.COMPLETED
                        ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400"
                        : isOverdue(task)
                        ? "text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400"
                        : "text-gray-500 bg-gray-100 dark:bg-gray-800 dark:text-gray-400"
                    }`}>
                      {STATUS_LABELS[task.status] || task.status}
                    </span>
                    <span className={`text-[11px] font-medium ${
                      task.priority === "URGENT" ? "text-red-500" :
                      task.priority === "HIGH" ? "text-orange-500" :
                      task.priority === "MEDIUM" ? "text-blue-500" :
                      "text-gray-500"
                    }`}>
                      {PRIORITY_LABELS[task.priority] || task.priority}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onEditTask(task)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-all"
                    aria-label="Tahrirlash"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onDeleteTask(task.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-all"
                    aria-label="O'chirish"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center py-8 text-center"
          >
            <ListTodo className="w-10 h-10 text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-sm text-gray-400 dark:text-gray-500">Bu kunga vazifalar yo'q</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Yangi vazifa qo'shish uchun yuqoridagi tugmani bosing</p>
          </motion.div>
        )}
      </motion.div>

      <div className="card p-4">
        <h3 className="font-semibold text-gray-900 dark:text-gray-50 text-sm mb-3">Tezkor filtrlar</h3>
        <div className="space-y-1.5">
          {filters.map((filter) => {
            const active = isFilterActive(filter.date);
            return (
              <button
                key={filter.label}
                onClick={() => onSelectDate(filter.date)}
                className={`flex items-center gap-2.5 w-full px-3 py-2 text-sm rounded-xl transition-all ${
                  active
                    ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 font-medium"
                    : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${filter.color}`} />
                {filter.label}
              </button>
            );
          })}
          <button
            onClick={() => {
              const overdue = tasks.find(
                (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== TaskStatus.COMPLETED && t.status !== TaskStatus.CANCELLED
              );
              if (overdue?.dueDate) onSelectDate(new Date(overdue.dueDate));
            }}
            className="flex items-center gap-2.5 w-full px-3 py-2 text-sm rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
          >
            <div className="w-2 h-2 rounded-full bg-red-500" />
            Muddati o'tgan
          </button>
        </div>
      </div>

      <div className="card p-4">
        <h3 className="font-semibold text-gray-900 dark:text-gray-50 text-sm mb-3">Legend</h3>
        <div className="space-y-1.5">
          {Object.entries(STATUS_LABELS).map(([key, label]) => (
            <div key={key} className="flex items-center gap-2.5 px-1 py-1">
              <div className={`w-2 h-2 rounded-full ${
                key === "PENDING" ? "bg-amber-500" :
                key === "IN_PROGRESS" ? "bg-blue-500" :
                key === TaskStatus.COMPLETED ? "bg-emerald-500" :
                key === "FAILED" ? "bg-red-500" :
                key === "POSTPONED" ? "bg-orange-500" :
                "bg-gray-500"
              }`} />
              <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
