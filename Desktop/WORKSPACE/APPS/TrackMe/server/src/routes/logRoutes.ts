import { Router } from "express";
import { createLog, getLogStats, listLogs, recentLogs } from "../controllers/logController";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { createHabitLogSchema } from "../schemas/logSchemas";

export const logRoutes = Router();

logRoutes.use(authenticate);
logRoutes.get("/", listLogs);
logRoutes.post("/", validate(createHabitLogSchema), createLog);
logRoutes.get("/stats", getLogStats);
logRoutes.get("/recent", recentLogs);
