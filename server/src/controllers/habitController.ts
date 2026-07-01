import type { Request, Response } from "express";
import mongoose from "mongoose";
import { HabitModel } from "../models/Habit";
import type { CreateHabitInput, UpdateHabitInput } from "../schemas/habitSchemas";
import { AppError, asyncHandler } from "../utils/http";

function ensureValidId(id: string) {
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError("Invalid habit id.", 400);
  }
}

export const listHabits = asyncHandler(async (req: Request, res: Response) => {
  const habits = await HabitModel.find({ createdBy: req.user!.id }).sort({ createdAt: -1 });
  res.json({ habits });
});

export const createHabit = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as CreateHabitInput;

  try {
    const habit = await HabitModel.create({
      ...input,
      createdBy: req.user!.id
    });

    res.status(201).json({ habit });
  } catch (error: any) {
    if (error.code === 11000) {
      throw new AppError("You already have a habit with this name.", 409);
    }

    throw error;
  }
});

export const getHabit = asyncHandler(async (req: Request, res: Response) => {
  const habitId = req.params.id as string;
  ensureValidId(habitId);

  const habit = await HabitModel.findOne({
    _id: habitId,
    createdBy: req.user!.id
  });

  if (!habit) {
    throw new AppError("Habit not found.", 404);
  }

  res.json({ habit });
});

export const updateHabit = asyncHandler(async (req: Request, res: Response) => {
  const habitId = req.params.id as string;
  ensureValidId(habitId);
  const input = req.body as UpdateHabitInput;

  const habit = await HabitModel.findOneAndUpdate(
    {
      _id: habitId,
      createdBy: req.user!.id
    },
    input,
    {
      new: true,
      runValidators: true
    }
  );

  if (!habit) {
    throw new AppError("Habit not found.", 404);
  }

  res.json({ habit });
});

export const deleteHabit = asyncHandler(async (req: Request, res: Response) => {
  const habitId = req.params.id as string;
  ensureValidId(habitId);

  const habit = await HabitModel.findOneAndDelete({
    _id: habitId,
    createdBy: req.user!.id
  });

  if (!habit) {
    throw new AppError("Habit not found.", 404);
  }

  res.status(204).send();
});
