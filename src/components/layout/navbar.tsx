"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Bell,
  Moon,
  Sun,
  LogOut,
  User,
  Settings,
  Search,
  Command,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useThemeStore } from "@/store/theme-store";

export function Navbar() {
  const router = useRouter();
  const { data: session } = useSession();
  const { theme, setTheme } = useThemeStore();
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const isDark = theme === "dark";

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) router.push(`/tasks?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <header className="fixed top-0 right-0 left-64 h-16 glass z-20 flex items-center justify-between px-6">
      <div className="flex items-center gap-4 flex-1 max-w-lg">
        <form onSubmit={handleSearch} className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Vazifalarni qidirish... (Ctrl+K)"
            className="w-full h-10 pl-10 pr-3 rounded-xl bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-gray-200/50 dark:bg-gray-700/50 text-[10px] font-medium text-gray-400">
            <Command className="w-3 h-3" />K
          </div>
        </form>
      </div>

      <div className="flex items-center gap-1">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setTheme(isDark ? "light" : "dark")}
          className="relative w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-all"
        >
          <AnimatePresence mode="wait">
            {isDark ? (
              <motion.div
                key="sun"
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 90 }}
                transition={{ duration: 0.2 }}
              >
                <Sun className="w-[18px] h-[18px]" />
              </motion.div>
            ) : (
              <motion.div
                key="moon"
                initial={{ scale: 0, rotate: 90 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: -90 }}
                transition={{ duration: 0.2 }}
              >
                <Moon className="w-[18px] h-[18px]" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        <div className="relative">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-all"
          >
            <Bell className="w-[18px] h-[18px]" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-gray-900" />
          </motion.button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-80 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-elevated p-1"
              >
                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Bildirishnomalar</p>
                </div>
                <div className="py-8 text-center">
                  <Bell className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Hali bildirishnoma yo'q</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="relative">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-2.5 p-1.5 pl-3 rounded-xl hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-all ml-2"
          >
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:block">
              {session?.user?.name || "Foydalanuvchi"}
            </span>
            {(session?.user as any)?.avatar ? (
              <img src={(session?.user as any).avatar} alt="" className="w-8 h-8 rounded-xl object-cover shadow-lg shadow-indigo-500/20" />
            ) : (
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-sm font-semibold shadow-lg shadow-indigo-500/20">
                {session?.user?.name?.[0]?.toUpperCase() || "U"}
              </div>
            )}
          </motion.button>

          <AnimatePresence>
            {showProfile && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-56 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-elevated p-1.5"
              >
                <div className="px-3 py-2.5 border-b border-gray-100 dark:border-gray-800 mb-1">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {session?.user?.name || "Foydalanuvchi"}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{session?.user?.email}</p>
                </div>
                <div className="space-y-0.5">
                  {[
                    { icon: User, label: "Profil", href: "/settings" },
                    { icon: Settings, label: "Sozlamalar", href: "/settings" },
                  ].map(({ icon: Icon, label, href }) => (
                    <button
                      key={label}
                      onClick={() => { setShowProfile(false); router.push(href); }}
                      className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all"
                    >
                      <Icon className="w-4 h-4" />
                      {label}
                    </button>
                  ))}
                  <div className="border-t border-gray-100 dark:border-gray-800 pt-0.5 mt-0.5">
                    <button
                      onClick={() => signOut({ callbackUrl: "/auth/login" })}
                      className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                    >
                      <LogOut className="w-4 h-4" />
                      Chiqish
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
