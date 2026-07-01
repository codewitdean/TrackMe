import { differenceInCalendarDays, format, startOfDay, subDays } from "date-fns";
import mongoose from "mongoose";
import { HabitModel } from "../models/Habit";
import { HabitLogModel } from "../models/HabitLog";
import { NlpParsedEntryModel } from "../models/NlpParsedEntry";

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
  recentEntries: Array<{
    id: string;
    rawText: string;
    habitName?: string;
    quantity?: number;
    unit?: string;
    date?: Date;
    confidence: number;
    needsConfirmation: boolean;
    createdAt?: Date;
  }>;
}

function dayKey(date: Date) {
  return format(startOfDay(date), "yyyy-MM-dd");
}

function buildDateRange(days: number) {
  return Array.from({ length: days }, (_, index) => startOfDay(subDays(new Date(), days - 1 - index)));
}

async function buildProgress(userId: mongoose.Types.ObjectId, days: number): Promise<ProgressPoint[]> {
  const range = buildDateRange(days);
  const firstDate = range[0];
  const totalHabits = await HabitModel.countDocuments({ createdBy: userId });
  const logs = await HabitLogModel.find({
    userId,
    date: { $gte: firstDate }
  }).select("date habitId");

  const byDay = new Map<string, Set<string>>();
  logs.forEach((log) => {
    const key = dayKey(log.date);
    const habits = byDay.get(key) ?? new Set<string>();
    habits.add(String(log.habitId));
    byDay.set(key, habits);
  });

  return range.map((date) => {
    const completed = byDay.get(dayKey(date))?.size ?? 0;
    const percentage = totalHabits > 0 ? Math.round((completed / totalHabits) * 100) : 0;

    return {
      label: days <= 7 ? format(date, "EEE") : format(date, "MMM d"),
      completed,
      target: totalHabits,
      percentage
    };
  });
}

async function calculateStreaks(userId: mongoose.Types.ObjectId) {
  const habits = await HabitModel.find({ createdBy: userId }).select("name");
  const since = startOfDay(subDays(new Date(), 90));
  const logs = await HabitLogModel.find({
    userId,
    date: { $gte: since }
  }).select("habitId date");

  const logDaysByHabit = new Map<string, Set<string>>();
  logs.forEach((log) => {
    const key = String(log.habitId);
    const days = logDaysByHabit.get(key) ?? new Set<string>();
    days.add(dayKey(log.date));
    logDaysByHabit.set(key, days);
  });

  return habits.map((habit) => {
    const days = logDaysByHabit.get(String(habit._id)) ?? new Set<string>();
    let currentStreak = 0;
    let cursor = startOfDay(new Date());

    // If a user has not logged today, yesterday can still be an active streak.
    if (!days.has(dayKey(cursor)) && days.has(dayKey(subDays(cursor, 1)))) {
      cursor = subDays(cursor, 1);
    }

    while (days.has(dayKey(cursor))) {
      currentStreak += 1;
      cursor = subDays(cursor, 1);
    }

    return {
      habitId: String(habit._id),
      habitName: habit.name,
      currentStreak
    };
  });
}

export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const today = startOfDay(new Date());
  const tomorrow = startOfDay(subDays(new Date(), -1));

  const [totalHabits, todayLogs, weeklyProgress, monthlyProgress, streaks, categoryRows, recentEntries] =
    await Promise.all([
      HabitModel.countDocuments({ createdBy: userObjectId }),
      HabitLogModel.find({
        userId: userObjectId,
        date: { $gte: today, $lt: tomorrow }
      }).select("habitId"),
      buildProgress(userObjectId, 7),
      buildProgress(userObjectId, 30),
      calculateStreaks(userObjectId),
      HabitModel.aggregate<{ _id: string; count: number }>([
        { $match: { createdBy: userObjectId } },
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      NlpParsedEntryModel.find({ userId: userObjectId }).sort({ createdAt: -1 }).limit(8)
    ]);

  const completedHabitIds = new Set(todayLogs.map((log) => String(log.habitId)));
  const todayCompleted = completedHabitIds.size;
  const completionPercentage = totalHabits > 0 ? Math.round((todayCompleted / totalHabits) * 100) : 0;

  return {
    todayCompleted,
    totalHabits,
    completionPercentage,
    weeklyProgress,
    monthlyProgress,
    streaks,
    categoryDistribution: categoryRows.map((row) => ({
      name: row._id,
      value: row.count
    })),
    recentEntries: recentEntries.map((entry) => ({
      id: String(entry._id),
      rawText: entry.rawText,
      habitName: entry.habitName ?? undefined,
      quantity: entry.quantity ?? undefined,
      unit: entry.unit ?? undefined,
      date: entry.date ?? undefined,
      confidence: entry.confidence,
      needsConfirmation: entry.needsConfirmation,
      createdAt: entry.createdAt
    }))
  };
}

export function calculateDaysBetween(from: Date, to: Date) {
  return Math.max(0, differenceInCalendarDays(startOfDay(to), startOfDay(from)));
}
