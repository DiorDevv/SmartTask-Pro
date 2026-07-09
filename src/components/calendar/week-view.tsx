"use client";

import { motion } from "framer-motion";
import { format, isSameDay, isToday, getHours, getMinutes } from "date-fns";
import type { Task } from "@/types";
import {
  getWeekDays, getDayHours, PRIORITY_DOTS, WEEK_DAYS_FULL,
} from "@/lib/calendar-utils";

interface WeekViewProps {
  currentDate: Date;
  selectedDate: Date;
  tasks: Task[];
  onSelectDate: (date: Date) => void;
  onEditTask: (task: Task) => void;
}

export function WeekView({ currentDate, selectedDate, tasks, onSelectDate, onEditTask }: WeekViewProps) {
  const weekDays = getWeekDays(currentDate);
  const hours = getDayHours();

  function getTasksForDay(date: Date): Task[] {
    return tasks.filter((t) => {
      if (!t.dueDate) return false;
      return isSameDay(new Date(t.dueDate), date);
    });
  }

  function getTaskTop(task: Task): number {
    if (!task.dueTime) return 0;
    const h = getHours(new Date(task.dueTime));
    const m = getMinutes(new Date(task.dueTime));
    return ((h - 7) * 60 + m) * (48 / 60);
  }

  const now = new Date();
  const currentHourTop = ((getHours(now) - 7) * 60 + getMinutes(now)) * (48 / 60);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card overflow-hidden"
    >
      <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-gray-100 dark:border-gray-800">
        <div className="p-2" />
        {weekDays.map((d, i) => {
          const isTodayDate = isToday(d);
          const isSelected = isSameDay(d, selectedDate);
          return (
            <button
              key={i}
              onClick={() => onSelectDate(d)}
              className={`p-2 text-center transition-colors ${
                isSelected ? "bg-indigo-50 dark:bg-indigo-900/10" : "hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              <div className={`text-xs font-medium ${isTodayDate ? "text-indigo-500" : "text-gray-400 dark:text-gray-500"}`}>
                {WEEK_DAYS_FULL[i].slice(0, 2)}
              </div>
              <div className={`w-8 h-8 mx-auto flex items-center justify-center rounded-full text-sm font-semibold mt-0.5 ${
                isTodayDate
                  ? "bg-indigo-500 text-white"
                  : "text-gray-700 dark:text-gray-300"
              }`}>
                {format(d, "d")}
              </div>
            </button>
          );
        })}
      </div>

      <div className="overflow-y-auto max-h-[600px] relative">
        <div className="grid grid-cols-[60px_repeat(7,1fr)]">
          {hours.map((hour) => (
            <div key={hour} className="contents">
              <div className="text-[10px] text-gray-400 dark:text-gray-500 text-right pr-2 py-[18px] border-t border-gray-50 dark:border-gray-800/50 select-none">
                {String(hour).padStart(2, "0")}:00
              </div>
              {weekDays.map((d, di) => {
                const dayTasks = getTasksForDay(d).filter(
                  (t) => t.dueTime && getHours(new Date(t.dueTime)) === hour
                );
                return (
                  <div
                    key={`${hour}-${di}`}
                    className="relative min-h-[48px] border-t border-gray-50 dark:border-gray-800/50 border-l border-gray-50 dark:border-gray-800/30"
                  >
                    {dayTasks.map((task) => (
                      <motion.button
                        key={task.id}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => onEditTask(task)}
                        className="absolute left-0.5 right-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium text-left leading-tight overflow-hidden cursor-pointer"
                        style={{
                          top: `${getTaskTop(task) % 48}px`,
                          backgroundColor: task.priority === "URGENT" ? "#FEE2E2" :
                            task.priority === "HIGH" ? "#FFEDD5" :
                            task.priority === "MEDIUM" ? "#DBEAFE" : "#F3F4F6",
                          color: task.priority === "URGENT" ? "#991B1B" :
                            task.priority === "HIGH" ? "#9A3412" :
                            task.priority === "MEDIUM" ? "#1E40AF" : "#374151",
                          height: "22px",
                        }}
                      >
                        <div className="flex items-center gap-1">
                          <div className={`w-1 h-1 rounded-full flex-shrink-0 ${PRIORITY_DOTS[task.priority] || "bg-gray-400"}`} />
                          <span className="truncate">{task.title}</span>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {currentHourTop >= 0 && currentHourTop < 48 * 16 && (
          <div
            className="absolute left-[60px] right-0 border-t-2 border-red-400 z-10 pointer-events-none"
            style={{ top: `${currentHourTop}px` }}
          >
            <div className="absolute -left-[7px] -top-[5px] w-3 h-3 rounded-full bg-red-400" />
          </div>
        )}
      </div>
    </motion.div>
  );
}
