export enum TaskStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  POSTPONED = "POSTPONED",
  CANCELLED = "CANCELLED",
}

export enum TaskPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  URGENT = "URGENT",
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: Date | null;
  dueTime: Date | null;
  isRecurring: boolean;
  recurrence: string | null;
  categoryId: string | null;
  category: Category | null;
  userId: string;
  subtasks: SubTask[];
  attachments: Attachment[];
  reminders: Reminder[];
  tags: Tag[];
  createdAt: Date;
  updatedAt: Date;
  completedAt: Date | null;
  archivedAt: Date | null;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string | null;
  userId: string;
  tasks: Task[];
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  taskId: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string | null;
  userId: string;
}

export interface Reminder {
  id: string;
  taskId: string;
  remindAt: Date;
  type: string;
  sent: boolean;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  taskId: string;
}

export interface Streak {
  id: string;
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastActive: Date | null;
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  timezone: string;
  theme: string;
  language: string;
  createdAt: Date;
  updatedAt: Date;
  hasPassword?: boolean;
}

export interface AppNotification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string | null;
  taskId: string | null;
  read: boolean;
  createdAt: Date;
}

export const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string; bgColor: string; icon: string }> = {
  [TaskStatus.PENDING]: {
    label: "Bajarilmagan",
    color: "text-yellow-500",
    bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
    icon: "clock",
  },
  [TaskStatus.IN_PROGRESS]: {
    label: "Bajarilmoqda",
    color: "text-blue-500",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
    icon: "loader",
  },
  [TaskStatus.COMPLETED]: {
    label: "Bajarildi",
    color: "text-emerald-500",
    bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
    icon: "check-circle",
  },
  [TaskStatus.FAILED]: {
    label: "Qilinmadi",
    color: "text-red-500",
    bgColor: "bg-red-50 dark:bg-red-900/20",
    icon: "x-circle",
  },
  [TaskStatus.POSTPONED]: {
    label: "Kechiktirildi",
    color: "text-orange-500",
    bgColor: "bg-orange-50 dark:bg-orange-900/20",
    icon: "calendar-off",
  },
  [TaskStatus.CANCELLED]: {
    label: "Bekor qilindi",
    color: "text-gray-500",
    bgColor: "bg-gray-50 dark:bg-gray-900/20",
    icon: "slash",
  },
};

export const PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string; badge: string }> = {
  [TaskPriority.LOW]: {
    label: "Past",
    color: "text-gray-500",
    badge: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300",
  },
  [TaskPriority.MEDIUM]: {
    label: "O'rta",
    color: "text-blue-500",
    badge: "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300",
  },
  [TaskPriority.HIGH]: {
    label: "Yuqori",
    color: "text-orange-500",
    badge: "bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300",
  },
  [TaskPriority.URGENT]: {
    label: "Favqulodda",
    color: "text-red-500",
    badge: "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300",
  },
};
