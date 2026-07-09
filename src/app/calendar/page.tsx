"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";
import { useTasks } from "@/hooks/use-tasks";
import { useCalendar } from "@/hooks/use-calendar";
import { CalendarHeader, CalendarNavigation } from "@/components/calendar/calendar-header";
import { MonthView } from "@/components/calendar/month-view";
import { WeekView } from "@/components/calendar/week-view";
import { DayView } from "@/components/calendar/day-view";
import { AgendaView } from "@/components/calendar/agenda-view";
import { SidePanel } from "@/components/calendar/side-panel";
import { TaskModal } from "@/components/tasks/task-modal";
import type { Task } from "@/types";

function CalendarSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          <div className="h-4 w-48 bg-gray-100 dark:bg-gray-800 rounded-lg" />
        </div>
        <div className="h-10 w-40 bg-gray-200 dark:bg-gray-700 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card p-4">
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 35 }).map((_, i) => (
                <div key={i} className="h-24 bg-gray-100 dark:bg-gray-800 rounded-lg" />
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="card p-4 h-48" />
          <div className="card p-4 h-32" />
        </div>
      </div>
    </div>
  );
}

export default function CalendarPage() {
  const queryClient = useQueryClient();
  const { data: tasks = [], isLoading, isError, error } = useTasks();
  const calendar = useCalendar();
  const [showNewTask, setShowNewTask] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [viewTransition, setViewTransition] = useState<"left" | "right" | null>(null);

  const handleEditTask = useCallback((task: Task) => {
    setEditingTask(task);
  }, []);

  const handleDeleteTask = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Vazifa o'chirildi");
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    } catch {
      toast.error("Xatolik yuz berdi");
    }
  }, [queryClient]);

  const handleToggleTask = useCallback(async (id: string) => {
    try {
      const task = tasks.find((t) => t.id === id);
      if (!task) return;
      const newStatus = task.status === "COMPLETED" ? "IN_PROGRESS" : "COMPLETED";
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error();
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    } catch {
      toast.error("Xatolik yuz berdi");
    }
  }, [tasks, queryClient]);

  const handleNavigate = useCallback((direction: "prev" | "next") => {
    setViewTransition(direction === "next" ? "right" : "left");
    if (direction === "next") calendar.goNext();
    else calendar.goPrev();
    setTimeout(() => setViewTransition(null), 300);
  }, [calendar]);

  if (isLoading) return <CalendarSkeleton />;

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
        <p className="text-lg font-medium text-gray-900 dark:text-gray-50 mb-2">Xatolik yuz berdi</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {error instanceof Error ? error.message : "Ma'lumotlarni yuklashda muammo bo'ldi"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CalendarHeader
        view={calendar.view}
        onViewChange={calendar.changeView}
        onNewTask={() => setShowNewTask(true)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <CalendarNavigation
            currentDate={calendar.currentDate}
            onPrev={() => handleNavigate("prev")}
            onNext={() => handleNavigate("next")}
            onToday={calendar.goToday}
          />

          <AnimatePresence mode="wait">
            <motion.div
              key={`${calendar.view}-${calendar.currentDate.toISOString()}`}
              initial={{ opacity: 0, x: viewTransition === "right" ? 30 : viewTransition === "left" ? -30 : 0 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: viewTransition === "right" ? -30 : viewTransition === "left" ? 30 : 0 }}
              transition={{ duration: 0.2 }}
            >
              {calendar.view === "month" && (
                <MonthView
                  currentDate={calendar.currentDate}
                  selectedDate={calendar.selectedDate}
                  tasks={tasks}
                  onSelectDate={calendar.selectDate}
                  onEditTask={handleEditTask}
                />
              )}
              {calendar.view === "week" && (
                <WeekView
                  currentDate={calendar.currentDate}
                  selectedDate={calendar.selectedDate}
                  tasks={tasks}
                  onSelectDate={calendar.selectDate}
                  onEditTask={handleEditTask}
                />
              )}
              {calendar.view === "day" && (
                <DayView
                  currentDate={calendar.currentDate}
                  tasks={tasks}
                  onEditTask={handleEditTask}
                  onDeleteTask={handleDeleteTask}
                  onToggleTask={handleToggleTask}
                />
              )}
              {calendar.view === "agenda" && (
                <AgendaView
                  tasks={tasks}
                  onEditTask={handleEditTask}
                  onDeleteTask={handleDeleteTask}
                  onToggleTask={handleToggleTask}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <SidePanel
          selectedDate={calendar.selectedDate}
          tasks={tasks}
          onEditTask={handleEditTask}
          onDeleteTask={handleDeleteTask}
          onToggleTask={handleToggleTask}
          onSelectDate={calendar.selectDate}
        />
      </div>

      {(showNewTask || editingTask) && (
        <TaskModal
          task={editingTask || undefined}
          onClose={() => { setShowNewTask(false); setEditingTask(null); }}
          onSuccess={() => { setShowNewTask(false); setEditingTask(null); }}
        />
      )}
    </div>
  );
}
