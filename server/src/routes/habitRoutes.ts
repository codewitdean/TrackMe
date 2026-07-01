import { Router } from "express";
import {
  createHabit,
  deleteHabit,
  getHabit,
  listHabits,
  updateHabit
} from "../controllers/habitController";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { createHabitSchema, updateHabitSchema } from "../schemas/habitSchemas";

export const habitRoutes = Router();

habitRoutes.use(authenticate);
habitRoutes.get("/", listHabits);
habitRoutes.post("/", validate(createHabitSchema), createHabit);
habitRoutes.get("/:id", getHabit);
habitRoutes.put("/:id", validate(updateHabitSchema), updateHabit);
habitRoutes.delete("/:id", deleteHabit);
