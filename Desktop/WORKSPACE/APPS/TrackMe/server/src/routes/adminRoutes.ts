import { Router } from "express";
import { getAdminAnalytics } from "../controllers/adminController";
import { authenticate } from "../middleware/auth";
import { requireRole } from "../middleware/roles";

export const adminRoutes = Router();

adminRoutes.use(authenticate, requireRole("admin"));
adminRoutes.get("/analytics", getAdminAnalytics);
