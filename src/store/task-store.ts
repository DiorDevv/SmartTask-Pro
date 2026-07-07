import { create } from "zustand";
import { Task, TaskStatus, TaskPriority } from "@/types";

interface TaskStore {
  tasks: Task[];
  selectedTasks: string[];
  view: "daily" | "weekly" | "monthly";
  filter: {
    status: TaskStatus | "ALL";
    priority: TaskPriority | "ALL";
    category: string | "ALL";
    search: string;
  };
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, data: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleSelectTask: (id: string) => void;
  selectAllTasks: () => void;
  clearSelection: () => void;
  setView: (view: "daily" | "weekly" | "monthly") => void;
  setFilter: (filter: Partial<TaskStore["filter"]>) => void;
}

export const useTaskStore = create<TaskStore>((set) => ({
  tasks: [],
  selectedTasks: [],
  view: "daily",
  filter: {
    status: "ALL",
    priority: "ALL",
    category: "ALL",
    search: "",
  },
  setTasks: (tasks) => set({ tasks }),
  addTask: (task) => set((state) => ({ tasks: [task, ...state.tasks] })),
  updateTask: (id, data) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...data } : t)),
    })),
  deleteTask: (id) =>
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id),
      selectedTasks: state.selectedTasks.filter((tid) => tid !== id),
    })),
  toggleSelectTask: (id) =>
    set((state) => ({
      selectedTasks: state.selectedTasks.includes(id)
        ? state.selectedTasks.filter((tid) => tid !== id)
        : [...state.selectedTasks, id],
    })),
  selectAllTasks: () =>
    set((state) => ({
      selectedTasks: state.tasks.map((t) => t.id),
    })),
  clearSelection: () => set({ selectedTasks: [] }),
  setView: (view) => set({ view }),
  setFilter: (filter) =>
    set((state) => ({
      filter: { ...state.filter, ...filter },
    })),
}));
