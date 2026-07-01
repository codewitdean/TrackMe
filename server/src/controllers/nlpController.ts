import type { Request, Response } from "express";
import { NlpParsedEntryModel } from "../models/NlpParsedEntry";
import type { ParseEntryInput } from "../schemas/nlpSchemas";
import { parseNaturalHabitEntry } from "../services/nlpParser";
import { asyncHandler } from "../utils/http";

export const parseEntry = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as ParseEntryInput;
  const parsed = parseNaturalHabitEntry(input.text);

  const entry = await NlpParsedEntryModel.create({
    userId: req.user!.id,
    rawText: parsed.rawText,
    habitName: parsed.habitName,
    action: parsed.action,
    quantity: parsed.quantity,
    unit: parsed.unit,
    date: parsed.date,
    category: parsed.category,
    confidence: parsed.confidence,
    needsConfirmation: parsed.needsConfirmation,
    message: parsed.message
  });

  res.json({
    parsed: {
      id: String(entry._id),
      ...parsed
    }
  });
});
