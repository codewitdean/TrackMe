import type { Request, Response } from "express";
import { HabitModel } from "../models/Habit";
import { HabitLogModel } from "../models/HabitLog";
import { NlpParsedEntryModel } from "../models/NlpParsedEntry";
import { UserModel } from "../models/User";
import { asyncHandler } from "../utils/http";

export const getAdminAnalytics = asyncHandler(async (_req: Request, res: Response) => {
  const [totalUsers, totalHabits, totalLogs, totalParsedEntries, roleBreakdown] = await Promise.all([
    UserModel.countDocuments(),
    HabitModel.countDocuments(),
    HabitLogModel.countDocuments(),
    NlpParsedEntryModel.countDocuments(),
    UserModel.aggregate<{ _id: string; count: number }>([
      { $group: { _id: "$role", count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ])
  ]);

  res.json({
    analytics: {
      totalUsers,
      totalHabits,
      totalLogs,
      totalParsedEntries,
      roleBreakdown: roleBreakdown.map((row: { _id: string; count: number }) => ({
        role: row._id,
        count: row.count
      }))
    }
  });
});
