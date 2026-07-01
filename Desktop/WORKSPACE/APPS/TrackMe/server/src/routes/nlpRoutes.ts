import { Router } from "express";
import { parseEntry } from "../controllers/nlpController";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { parseEntrySchema } from "../schemas/nlpSchemas";

export const nlpRoutes = Router();

nlpRoutes.use(authenticate);
nlpRoutes.post("/parse", validate(parseEntrySchema), parseEntry);
