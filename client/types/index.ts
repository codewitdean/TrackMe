export type UserRole = "user" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Habit {
  _id: string;
  name: string;
  category: string;
  targetValue: number;
  unit: string;
  frequency: "daily" | "weekly" | "monthly" | "custom";
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface HabitLog {
  _id: string;
  userId: string;
  habitId: string | Habit;
  rawText: string;
  parsedHabitName: string;
  quantity: number;
  unit: string;
  date: string;
  category: string;
  createdAt: string;
}

export interface ParsedEntry {
  id?: string;
  rawText: string;
  habitName?: string;
  action?: string;
  quantity?: number;
  unit?: string;
  date?: string;
  category?: string;
  confidence: number;
  needsConfirmation: boolean;
  message: string;
}

export interface ProgressPoint {
  label: string;
  completed: number;
  target: number;
  percentage: number;
}

export interface DashboardStats {
  todayCompleted: number;
  totalHabits: number;
  completionPercentage: number;
  weeklyProgress: ProgressPoint[];
  monthlyProgress: ProgressPoint[];
  streaks: Array<{
    habitId: string;
    habitName: string;
    currentStreak: number;
  }>;
  categoryDistribution: Array<{
    name: string;
    value: number;
  }>;
  recentEntries: ParsedEntry[];
}

export interface AdminAnalytics {
  totalUsers: number;
  totalHabits: number;
  totalLogs: number;
  totalParsedEntries: number;
  roleBreakdown: Array<{
    role: UserRole;
    count: number;
  }>;
}
