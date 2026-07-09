"use client";

import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import type { CalendarView } from "@/lib/calendar-utils";
import { formatMonth } from "@/lib/calendar-utils";

interface CalendarHeaderProps {
  view: CalendarView;
  onViewChange: (view: CalendarView) => void;
  onNewTask: () => void;
}

const views: { key: CalendarView; label: string }[] = [
  { key: "month", label: "Oy" },
  { key: "week", label: "Hafta" },
  { key: "day", label: "Kun" },
  { key: "agenda", label: "Ro'yxat" },
];

export function CalendarHeader({
  view, onViewChange, onNewTask,
}: CalendarHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Taqvim</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Vazifalaringizni taqvimda ko'ring va boshqaring</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 p-1 rounded-xl bg-gray-100 dark:bg-gray-800">
          {views.map((v) => (
            <button
              key={v.key}
              onClick={() => onViewChange(v.key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                view === v.key
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
        <button className="btn-primary btn-md" onClick={onNewTask}>
          <Plus className="w-4 h-4" />
          Tadbir qo'shish
        </button>
      </div>
    </div>
  );
}

export function CalendarNavigation({
  currentDate, onPrev, onNext, onToday,
}: {
  currentDate: Date;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <motion.h2
          key={currentDate.toISOString()}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-lg font-semibold text-gray-900 dark:text-gray-50 min-w-[180px]"
        >
          {formatMonth(currentDate)}
        </motion.h2>
        <div className="flex items-center gap-1">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onPrev}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
            aria-label="Oldingi"
          >
            <ChevronLeft className="w-5 h-5" />
          </motion.button>
          <button
            onClick={onToday}
            className="px-3 py-1.5 rounded-lg text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
          >
            Bugun
          </button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onNext}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
            aria-label="Keyingi"
          >
            <ChevronRight className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
