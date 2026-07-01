import { z } from "zod";

export const createHabitLogSchema = z.object({
  body: z.object({
    habitId: z.string().optional(),
    rawText: z.string().trim().min(2).max(500),
    parsedHabitName: z.string().trim().min(2).max(100),
    quantity: z.coerce.number().positive(),
    unit: z.string().trim().min(1).max(40),
    date: z.coerce.date(),
    category: z.string().trim().min(2).max(80)
  })
});

export type CreateHabitLogInput = z.infer<typeof createHabitLogSchema>["body"];
