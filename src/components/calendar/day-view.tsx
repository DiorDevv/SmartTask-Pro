"use client";

import { motion } from "framer-motion";
import { isSameDay, getHours, getMinutes, isToday } from "date-fns";
import {
  CheckCircle2, Circle, Edit3, Trash2,
} from "lucide-react";
import { TaskStatus } from "@/types";
import type { Task } from "@/types";
import {
  getDayHours, PRIORITY_DOTS, formatDate, formatTime,
} from "@/lib/calendar-utils";

interface DayViewProps {
  currentDate: Date;
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onToggleTask: (id: string) => void;
}

export function DayView({ currentDate, tasks, onEditTask, onDeleteTask, onToggleTask }: DayViewProps) {
  const hours = getDayHours();

  const dayTasks = tasks.filter((t) => {
    if (!t.dueDate) return false;
    return isSameDay(new Date(t.dueDate), currentDate);
  });

  const now = new Date();
  const currentHourTop = isToday(currentDate)
    ? ((getHours(now) - 7) * 60 + getMinutes(now)) * (60 / 60)
    : -1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card overflow-hidden"
    >
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <h3 className="font-semibold text-gray-900 dark:text-gray-50">
          {formatDate(currentDate)}
        </h3>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
          {dayTasks.length} ta vazifa
        </p>
      </div>

      <div className="overflow-y-auto max-h-[650px]">
        {hours.map((hour) => {
          const hourTasks = dayTasks.filter(
            (t) => t.dueTime && getHours(new Date(t.dueTime)) === hour
          );
          const noTimeTasks = hour === 7 ? dayTasks.filter((t) => !t.dueTime) : [];

          return (
            <div key={hour} className="flex border-b border-gray-50 dark:border-gray-800/50 min-h-[60px] group">
              <div className="w-16 flex-shrink-0 text-[10px] text-gray-400 dark:text-gray-500 text-right pr-3 pt-1 select-none">
                {String(hour).padStart(2, "0")}:00
              </div>
              <div className="flex-1 relative border-l border-gray-100 dark:border-gray-800/30 p-1">
                {hour === 7 && noTimeTasks.map((task) => (
                  <div
                    key={task.id}
                    className="px-2 py-1.5 mb-1 rounded-lg bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-900/10 dark:to-violet-900/10 border border-indigo-100 dark:border-indigo-800/30"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <button onClick={() => onToggleTask(task.id)}>
                          {task.status === TaskStatus.COMPLETED ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          ) : (
                            <Circle className="w-4 h-4 text-gray-300 dark:text-gray-600 flex-shrink-0" />
                          )}
                        </button>
                        <div className={`w-1.5 h-1.5 rounded-full ${PRIORITY_DOTS[task.priority] || "bg-gray-400"}`} />
                        <span className={`text-sm font-medium truncate ${
                          task.status === TaskStatus.COMPLETED ? "line-through text-gray-400" : "text-gray-900 dark:text-gray-100"
                        }`}>
                          {task.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => onEditTask(task)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                          <Edit3 className="w-3.5 h-3.5 text-gray-400" />
                        </button>
                        <button onClick={() => onDeleteTask(task.id)} className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded">
                          <Trash2 className="w-3.5 h-3.5 text-gray-400 hover:text-red-500" />
                        </button>
                      </div>
                    </div>
                    {task.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-8 line-clamp-1">{task.description}</p>
                    )}
                  </div>
                ))}
                {hourTasks.map((task) => (
                  <div
                    key={task.id}
                    className="absolute left-1 right-1 px-2 py-1 rounded-lg overflow-hidden cursor-pointer hover:ring-1 hover:ring-indigo-300 dark:hover:ring-indigo-700 transition-all"
                    style={{
                      top: `${(getMinutes(new Date(task.dueTime!)) / 60) * 60}px`,
                      minHeight: "24px",
                      background: task.priority === "URGENT" ? "linear-gradient(135deg, #FEE2E2, #FECACA)" :
                        task.priority === "HIGH" ? "linear-gradient(135deg, #FFEDD5, #FED7AA)" :
                        task.priority === "MEDIUM" ? "linear-gradient(135deg, #DBEAFE, #BFDBFE)" :
                        "linear-gradient(135deg, #F3F4F6, #E5E7EB)",
                    }}
                    onClick={() => onEditTask(task)}
                  >
                    <div className="flex items-center gap-1">
                      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${PRIORITY_DOTS[task.priority] || "bg-gray-400"}`} />
                      <span className="text-xs font-medium truncate">{task.title}</span>
                      <span className="text-[10px] text-gray-500 ml-auto">{formatTime(task.dueTime)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {currentHourTop >= 0 && (
          <div className="flex" style={{ marginTop: "-1px" }}>
            <div className="w-16 flex-shrink-0" />
            <div className="flex-1 relative border-l border-gray-100 dark:border-gray-800/30">
              <div className="border-t-2 border-red-400 z-10 relative">
                <div className="absolute -left-[5px] -top-[5px] w-2.5 h-2.5 rounded-full bg-red-400" />
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
