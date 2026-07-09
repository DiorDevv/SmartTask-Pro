"use client";

import { motion } from "framer-motion";

interface ProgressBarProps {
  value: number;
  label?: string;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export function ProgressBar({ value, label, size = "md", showLabel = true }: ProgressBarProps) {
  const heights = { sm: "h-1.5", md: "h-2.5", lg: "h-3.5" };
  const clampedValue = Math.min(100, Math.max(0, isNaN(value) ? 0 : value));

  const gradient =
    clampedValue >= 80
      ? "bg-gradient-to-r from-emerald-500 via-emerald-400 to-green-400"
      : clampedValue >= 50
      ? "bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400"
      : "bg-gradient-to-r from-indigo-500 via-indigo-400 to-violet-400";

  return (
    <div className="space-y-1.5">
      {showLabel && (
        <div className="flex items-center justify-between">
          {label && <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</span>}
          <span className="text-sm font-bold text-gray-900 dark:text-gray-50">{Math.round(clampedValue)}%</span>
        </div>
      )}
      <div
          role="progressbar"
          aria-valuenow={Math.round(clampedValue)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={label || "Progress"}
          className={`w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden ${heights[size]}`}
        >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${clampedValue}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`${heights[size]} ${gradient} rounded-full relative`}
        >
          <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse" />
        </motion.div>
      </div>
    </div>
  );
}
