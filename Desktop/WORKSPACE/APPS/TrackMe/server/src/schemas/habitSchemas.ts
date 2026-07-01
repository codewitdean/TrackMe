import { z } from "zod";
import { habitFrequencies } from "../models/Habit";

export const createHabitSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(100),
    category: z.string().trim().min(2).max(80),
    targetValue: z.coerce.number().positive(),
    unit: z.string().trim().min(1).max(40),
    frequency: z.enum(habitFrequencies).default("daily")
  })
});

export const updateHabitSchema = z.object({
  body: createHabitSchema.shape.body.partial().refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required"
  })
});

export type CreateHabitInput = z.infer<typeof createHabitSchema>["body"];
export type UpdateHabitInput = z.infer<typeof updateHabitSchema>["body"];
