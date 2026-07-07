"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Navbar } from "./navbar";
import { TaskModal } from "@/components/tasks/task-modal";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [showNewTask, setShowNewTask] = useState(false);

  return (
    <div className="min-h-screen">
      <Sidebar onNewTask={() => setShowNewTask(true)} />
      <Navbar />
      <main className="pl-64 pt-16 min-h-screen transition-all duration-200">
        <div className="p-6 lg:p-8 max-w-[1400px] mx-auto">{children}</div>
      </main>
      {showNewTask && <TaskModal onClose={() => setShowNewTask(false)} />}
    </div>
  );
}
