import type { Request, Response } from "express";
import { startOfDay } from "date-fns";
import mongoose from "mongoose";
import { HabitModel } from "../models/Habit";
import { HabitLogModel } from "../models/HabitLog";
import { ProgressHistoryModel } from "../models/ProgressHistory";
import type { CreateHabitLogInput } from "../schemas/logSchemas";
import { getDashboardStats } from "../services/statsService";
import { AppError, asyncHandler } from "../utils/http";

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function findOrCreateHabit(userId: string, input: CreateHabitLogInput) {
  if (input.habitId) {
    if (!mongoose.isValidObjectId(input.habitId)) {
      throw new AppError("Invalid habit id.", 400);
    }

    const habit = await HabitModel.findOne({
      _id: input.habitId,
      createdBy: userId
    });

    if (!habit) {
      throw new AppError("Habit not found.", 404);
    }

    return habit;
  }

  const existingHabit = await HabitModel.findOne({
    createdBy: userId,
    name: new RegExp(`^${escapeRegex(input.parsedHabitName)}$`, "i")
  });

  if (existingHabit) {
    return existingHabit;
  }

  return HabitModel.create({
    name: input.parsedHabitName,
    category: input.category,
    targetValue: input.quantity,
    unit: input.unit,
    frequency: "daily",
    createdBy: userId
  });
}

async function updateProgressHistory(userId: string, habitId: string, date: Date) {
  const habit = await HabitModel.findById(habitId);
  if (!habit) return;

  const dayStart = startOfDay(date);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  const logs = await HabitLogModel.find({
    userId,
    habitId,
    date: { $gte: dayStart, $lt: dayEnd }
  }).select("quantity");

  const completedQuantity = logs.reduce((sum, log) => sum + log.quantity, 0);
  const completionPercentage = Math.min(100, Math.round((completedQuantity / habit.targetValue) * 100));

  await ProgressHistoryModel.findOneAndUpdate(
    {
      userId,
      habitId,
      date: dayStart
    },
    {
      completedQuantity,
      completionPercentage
    },
    {
      upsert: true,
      new: true
    }
  );
}

export const listLogs = asyncHandler(async (req: Request, res: Response) => {
  const logs = await HabitLogModel.find({ userId: req.user!.id })
    .populate("habitId", "name category targetValue unit frequency")
    .sort({ date: -1, createdAt: -1 });

  res.json({ logs });
});

export const createLog = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as CreateHabitLogInput;
  const habit = await findOrCreateHabit(req.user!.id, input);

  const log = await HabitLogModel.create({
    userId: req.user!.id,
    habitId: habit._id,
    rawText: input.rawText,
    parsedHabitName: input.parsedHabitName,
    quantity: input.quantity,
    unit: input.unit,
    date: input.date,
    category: input.category
  });

  await updateProgressHistory(req.user!.id, String(habit._id), input.date);

  res.status(201).json({ log });
});

export const getLogStats = asyncHandler(async (req: Request, res: Response) => {
  const stats = await getDashboardStats(req.user!.id);
  res.json({ stats });
});

export const recentLogs = asyncHandler(async (req: Request, res: Response) => {
  const logs = await HabitLogModel.find({ userId: req.user!.id })
    .sort({ createdAt: -1 })
    .limit(10)
    .populate("habitId", "name category unit");

  res.json({ logs });
});
