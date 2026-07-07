"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  ListTodo,
} from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns";

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);

  const days: Date[] = [];
  let day = calStart;
  while (day <= calEnd) {
    days.push(day);
    day = addDays(day, 1);
  }

  const weekDays = ["Du", "Se", "Ch", "Pa", "Ju", "Sh", "Ya"];

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const events: Record<string, { title: string; color: string }[]> = {
    "2026-07-07": [
      { title: "Tonggi mashq", color: "bg-success" },
      { title: "Jamoa yig'ilishi", color: "bg-primary" },
      { title: "Code Review", color: "bg-info" },
    ],
    "2026-07-08": [
      { title: "Kitob o'qish", color: "bg-secondary" },
    ],
    "2026-07-10": [
      { title: "Client call", color: "bg-warning" },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text dark:text-text-dark">Taqvim</h1>
          <p className="text-muted text-sm mt-1">Vazifalaringizni taqvimda ko'ring</p>
        </div>
        <button className="btn-primary btn-md">
          <Plus className="w-4 h-4" />
          Tadbir qo'shish
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text dark:text-text-dark">
                {format(currentMonth, "MMMM yyyy")}
              </h2>
              <div className="flex items-center gap-1">
                <button
                  onClick={prevMonth}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-muted"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setCurrentMonth(new Date())}
                  className="btn-ghost btn-sm"
                >
                  Bugun
                </button>
                <button
                  onClick={nextMonth}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-muted"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 mb-2">
              {weekDays.map((d) => (
                <div key={d} className="text-center text-xs font-medium text-muted py-2">
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {days.map((d) => {
                const dateKey = format(d, "yyyy-MM-dd");
                const dayEvents = events[dateKey] || [];
                const isSelected = isSameDay(d, selectedDate);

                return (
                  <motion.button
                    key={dateKey}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedDate(d)}
                    className={`min-h-[80px] p-1.5 rounded-lg text-left transition-colors ${
                      !isSameMonth(d, currentMonth)
                        ? "opacity-40"
                        : isSelected
                        ? "bg-primary/10 ring-1 ring-primary"
                        : "hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                  >
                    <span
                      className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm ${
                        isToday(d)
                          ? "bg-primary text-white"
                          : "text-text dark:text-text-dark"
                      }`}
                    >
                      {format(d, "d")}
                    </span>
                    <div className="space-y-0.5 mt-1">
                      {dayEvents.slice(0, 2).map((ev, i) => (
                        <div
                          key={i}
                          className={`text-[10px] px-1 py-0.5 rounded ${ev.color} text-white truncate`}
                        >
                          {ev.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-[10px] text-muted pl-1">
                          +{dayEvents.length - 2} more
                        </div>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-4">
              <CalendarIcon className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-text dark:text-text-dark">
                {format(selectedDate, "d MMMM, EEEE")}
              </h3>
            </div>

            {events[format(selectedDate, "yyyy-MM-dd")] ? (
              <div className="space-y-2">
                {events[format(selectedDate, "yyyy-MM-dd")].map((ev, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                    <div className={`w-1 h-8 rounded-full ${ev.color}`} />
                    <div>
                      <p className="text-sm font-medium text-text dark:text-text-dark">{ev.title}</p>
                      <p className="text-xs text-muted">Butun kun</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center py-8 text-center">
                <ListTodo className="w-8 h-8 text-muted mb-2" />
                <p className="text-sm text-muted">Bu kunga vazifalar yo'q</p>
              </div>
            )}
          </div>

          <div className="card p-4">
            <h3 className="font-semibold text-text dark:text-text-dark mb-3">Tezkor filtrlar</h3>
            <div className="space-y-2">
              {[
                { label: "Bugun", color: "bg-primary", active: true },
                { label: "Ertaga", color: "bg-info" },
                { label: "Shu hafta", color: "bg-success" },
                { label: "Muddati o'tgan", color: "bg-danger" },
              ].map((filter) => (
                <button
                  key={filter.label}
                  className={`flex items-center gap-2 w-full px-3 py-2 text-sm rounded-lg transition-colors ${
                    filter.active
                      ? "bg-primary/10 text-primary"
                      : "text-muted hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${filter.color}`} />
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
