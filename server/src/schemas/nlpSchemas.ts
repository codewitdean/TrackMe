import { z } from "zod";

export const parseEntrySchema = z.object({
  body: z.object({
    text: z.string().trim().min(2).max(500)
  })
});

export type ParseEntryInput = z.infer<typeof parseEntrySchema>["body"];
