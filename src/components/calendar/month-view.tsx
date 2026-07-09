"use client";

import { motion } from "framer-motion";
import { isSameMonth, isSameDay, isToday, format } from "date-fns";
import { TaskStatus } from "@/types";
import type { Task } from "@/types";
import {
  getMonthDays, PRIORITY_DOTS, WEEK_DAYS,
} from "@/lib/calendar-utils";

interface MonthViewProps {
  currentDate: Date;
  selectedDate: Date;
  tasks: Task[];
  onSelectDate: (date: Date) => void;
  onEditTask: (task: Task) => void;
}

export function MonthView({ currentDate, selectedDate, tasks, onSelectDate, onEditTask }: MonthViewProps) {
  const days = getMonthDays(currentDate);

  const events: Record<string, Task[]> = {};
  tasks.forEach((task) => {
    if (!task.dueDate) return;
    const key = format(new Date(task.dueDate), "yyyy-MM-dd");
    if (!events[key]) events[key] = [];
    events[key].push(task);
  });

  const weeks: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return (
    <div className="card p-4 overflow-hidden">
      <div className="grid grid-cols-7 mb-1">
        {WEEK_DAYS.map((d) => (
          <div key={d} className="text-center text-xs font-semibold text-gray-400 dark:text-gray-500 py-2 uppercase tracking-wider">
            {d}
          </div>
        ))}
      </div>

      <motion.div
        key={format(currentDate, "yyyy-MM")}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.2 }}
      >
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 gap-px">
            {week.map((d) => {
              const dateKey = format(d, "yyyy-MM-dd");
              const dayEvents = events[dateKey] || [];
              const isSelected = isSameDay(d, selectedDate);
              const isCurrentMonth = isSameMonth(d, currentDate);
              const isTodayDate = isToday(d);
              const overdueCount = dayEvents.filter(
                (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== TaskStatus.COMPLETED && t.status !== TaskStatus.CANCELLED
              ).length;

              return (
                <motion.button
                  key={dateKey}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onSelectDate(d)}
                  className={`min-h-[90px] p-1.5 text-left transition-all border-b border-gray-50 dark:border-gray-800/50 ${
                    !isCurrentMonth
                      ? "opacity-30"
                      : isSelected
                      ? "bg-indigo-50/50 dark:bg-indigo-900/10"
                      : "hover:bg-gray-50 dark:hover:bg-gray-800/30"
                  } ${isTodayDate ? "ring-1 ring-indigo-500/30 dark:ring-indigo-400/30" : ""}`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold ${
                        isTodayDate
                          ? "bg-indigo-500 text-white shadow-sm shadow-indigo-500/30"
                          : "text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {format(d, "d")}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 tabular-nums">
                        {dayEvents.length}
                      </span>
                    )}
                  </div>

                  <div className="space-y-0.5">
                    {dayEvents.slice(0, 2).map((task) => (
                      <div
                        key={task.id}
                        onClick={(e) => { e.stopPropagation(); onEditTask(task); }}
                        className="group relative flex items-center gap-1 px-1 py-0.5 rounded text-[10px] font-medium cursor-pointer transition-all hover:scale-[1.02]"
                      >
                        <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${PRIORITY_DOTS[task.priority] || "bg-gray-400"}`} />
                        <span className={`truncate leading-tight ${
                          task.status === TaskStatus.COMPLETED
                            ? "line-through text-gray-400 dark:text-gray-500"
                            : task.dueDate && new Date(task.dueDate) < new Date()
                            ? "text-red-600 dark:text-red-400"
                            : "text-gray-700 dark:text-gray-300"
                        }`}>
                          {task.title}
                        </span>
                        {task.dueTime && (
                          <span className="text-[8px] text-gray-400 dark:text-gray-500 flex-shrink-0 ml-auto">
                            {format(new Date(task.dueTime), "HH:mm")}
                          </span>
                        )}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-[10px] text-gray-400 dark:text-gray-500 pl-1 font-medium">
                        +{dayEvents.length - 2} ta ko'proq
                      </div>
                    )}
                  </div>

                  {overdueCount > 0 && (
                    <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-red-500" />
                  )}
                </motion.button>
              );
            })}
          </div>
        ))}
      </motion.div>
    </div>
  );
}
