"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Circle,
  Clock,
  Calendar,
  Flag,
  Trash2,
  Edit3,
  ChevronDown,
  ChevronRight,
  ListChecks,
} from "lucide-react";
import { Task, TaskStatus, STATUS_CONFIG, PRIORITY_CONFIG } from "@/types";
import { cn, formatDate, formatTime } from "@/lib/utils";

interface TaskCardProps {
  task: Task;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export function TaskCard({ task, onStatusChange, onEdit, onDelete }: TaskCardProps) {
  const [expanded, setExpanded] = useState(false);

  const statusConfig = STATUS_CONFIG[task.status];
  const priorityConfig = PRIORITY_CONFIG[task.priority];
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== TaskStatus.COMPLETED && task.status !== TaskStatus.CANCELLED;

  const handleToggle = () => {
    const newStatus = task.status === TaskStatus.COMPLETED ? TaskStatus.IN_PROGRESS : TaskStatus.COMPLETED;
    onStatusChange(task.id, newStatus);
  };

  const priorityDots = {
    LOW: "bg-gray-400",
    MEDIUM: "bg-blue-500",
    HIGH: "bg-orange-500",
    URGENT: "bg-red-500",
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className={cn(
        "card card-hover p-4 group",
        task.status === TaskStatus.COMPLETED && "opacity-70"
      )}
    >
      <div className="flex items-start gap-3.5">
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={handleToggle}
          aria-label={task.status === TaskStatus.COMPLETED ? "Vazifani ochiq deb belgilash" : "Vazifani bajarildi deb belgilash"}
          className="mt-0.5 flex-shrink-0 transition-all"
        >
          {task.status === TaskStatus.COMPLETED ? (
            <CheckCircle2 className="w-[22px] h-[22px] text-emerald-500 drop-shadow-sm" />
          ) : (
            <Circle className="w-[22px] h-[22px] text-gray-300 dark:text-gray-600 group-hover:text-indigo-400 transition-colors" />
          )}
        </motion.button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className={`w-2 h-2 rounded-full ${priorityDots[task.priority] || "bg-gray-400"} flex-shrink-0`} />
            <h3
              className={cn(
                "text-sm font-semibold text-gray-900 dark:text-gray-100 leading-5",
                task.status === TaskStatus.COMPLETED && "line-through text-gray-400 dark:text-gray-500"
              )}
            >
              {task.title}
            </h3>
            <span className={cn("badge", priorityConfig.badge)}>
              <Flag className="w-3 h-3" />
              {priorityConfig.label}
            </span>
            <span className={cn("badge", statusConfig.bgColor, statusConfig.color)}>
              {statusConfig.label}
            </span>
          </div>

          {task.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5 line-clamp-2 leading-relaxed">
              {task.description}
            </p>
          )}

          <div className="flex items-center gap-4 mt-2.5 flex-wrap">
            {task.dueDate && (
              <span
                className={cn(
                  "flex items-center gap-1.5 text-xs font-medium",
                  isOverdue ? "text-red-500" : "text-gray-400 dark:text-gray-500"
                )}
              >
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(task.dueDate)}
                {task.dueTime && <>{formatTime(task.dueTime)}</>}
                {isOverdue && (
                  <span className="px-1.5 py-0.5 rounded-md bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[10px] font-semibold uppercase tracking-wider">
                    Kechikkan
                  </span>
                )}
              </span>
            )}
            {task.subtasks && task.subtasks.length > 0 && (
              <span className="flex items-center gap-1.5 text-xs font-medium text-gray-400 dark:text-gray-500">
                <ListChecks className="w-3.5 h-3.5" />
                {task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length}
              </span>
            )}
            {task.isRecurring && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-semibold uppercase tracking-wider">
                <Clock className="w-3 h-3" />
                {task.recurrence === "daily" ? "Har kuni" : task.recurrence === "weekly" ? "Har hafta" : "Har oy"}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => onEdit(task)}
            aria-label="Vazifani tahrirlash"
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-all"
          >
            <Edit3 className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => { if (confirm("Vazifani o'chirishni xohlaysizmi?")) onDelete(task.id); }}
            aria-label="Vazifani o'chirish"
            className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {expanded && task.subtasks && task.subtasks.length > 0 && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          className="mt-3.5 pl-9 space-y-1.5 border-t border-gray-100 dark:border-gray-800 pt-3"
        >
          {task.subtasks.map((subtask) => (
            <div key={subtask.id} className="flex items-center gap-2.5 py-1 group/sub">
              {subtask.completed ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
              ) : (
                <Circle className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600 flex-shrink-0" />
              )}
              <span className={cn(
                "text-sm",
                subtask.completed
                  ? "line-through text-gray-400 dark:text-gray-500"
                  : "text-gray-700 dark:text-gray-300"
              )}>
                {subtask.title}
              </span>
            </div>
          ))}
        </motion.div>
      )}

      {task.subtasks && task.subtasks.length > 0 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-2 flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors pl-9"
        >
          {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          {expanded ? "Yashirish" : `${task.subtasks.length} ta sub-vazifa`}
        </button>
      )}
    </motion.div>
  );
}
