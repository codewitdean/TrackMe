import { Router } from "express";
import { login, me, register } from "../controllers/authController";
import { authenticate } from "../middleware/auth";
import { authRateLimiter } from "../middleware/rateLimit";
import { validate } from "../middleware/validate";
import { loginSchema, registerSchema } from "../schemas/authSchemas";

export const authRoutes = Router();

authRoutes.post("/register", authRateLimiter, validate(registerSchema), register);
authRoutes.post("/login", authRateLimiter, validate(loginSchema), login);
authRoutes.get("/me", authenticate, me);
