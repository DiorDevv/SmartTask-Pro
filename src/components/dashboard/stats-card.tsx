"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  gradient: string;
  trend?: { value: number; positive: boolean };
}

export function StatsCard({ title, value, icon: Icon, gradient, trend }: StatsCardProps) {
  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.01 }}
      className="card card-hover p-5 relative overflow-hidden group"
    >
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${gradient}`} />
      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-50 tracking-tight">{value}</p>
            {trend && (
              <p className={`flex items-center gap-1 text-xs font-medium ${trend.positive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                <span>{trend.positive ? "↑" : "↓"}</span>
                <span>{Math.abs(trend.value)}% o'tgan haftaga nisbatan</span>
              </p>
            )}
          </div>
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${gradient} shadow-lg`}>
            <Icon className="w-[22px] h-[22px] text-white" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
