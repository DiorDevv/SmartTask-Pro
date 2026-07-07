"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  ListTodo,
  Calendar,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Plus,
  Target,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tasks", label: "Vazifalar", icon: ListTodo },
  { href: "/calendar", label: "Taqvim", icon: Calendar },
  { href: "/analytics", label: "Analitika", icon: BarChart3 },
  { href: "/settings", label: "Sozlamalar", icon: Settings },
];

interface SidebarProps {
  onNewTask: () => void;
}

export function Sidebar({ onNewTask }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const linkClass = (href: string) => {
    const isActive = pathname.startsWith(href);
    return `relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
      isActive
        ? "text-white"
        : "text-gray-400 hover:text-white hover:bg-white/5"
    }`;
  };

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 256 }}
      className="fixed left-0 top-0 h-screen bg-gradient-to-b from-gray-900 via-gray-950 to-black border-r border-white/5 z-30 flex flex-col"
    >
      <div className="flex items-center h-16 px-4 border-b border-white/5">
        <motion.div
          animate={{ width: collapsed ? 40 : "auto" }}
          className="flex items-center gap-3 overflow-hidden"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/25">
            <Target className="w-5 h-5 text-white" />
          </div>
          <motion.span
            animate={{ opacity: collapsed ? 0 : 1, x: collapsed ? -10 : 0 }}
            className="font-bold text-lg text-white whitespace-nowrap tracking-tight"
          >
            SmartTask
          </motion.span>
        </motion.div>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-hidden">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={linkClass(item.href)}
            >
              {isActive && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/20 to-violet-500/20 border border-indigo-500/30"
                />
              )}
              <item.icon className="w-5 h-5 flex-shrink-0 relative z-10" />
              <motion.span
                animate={{ opacity: collapsed ? 0 : 1, x: collapsed ? -10 : 0 }}
                className="relative z-10 whitespace-nowrap"
              >
                {item.label}
              </motion.span>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-white/5">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onNewTask}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:from-indigo-400 hover:to-violet-500 transition-all duration-200"
        >
          <Plus className="w-5 h-5 flex-shrink-0" />
          <motion.span
            animate={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : "auto" }}
            className="overflow-hidden"
          >
            Yangi Vazifa
          </motion.span>
        </motion.button>
      </div>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center h-11 border-t border-white/5 text-gray-500 hover:text-white hover:bg-white/5 transition-colors"
      >
        <motion.div animate={{ rotate: collapsed ? 180 : 0 }}>
          <ChevronLeft className="w-4 h-4" />
        </motion.div>
      </button>
    </motion.aside>
  );
}
