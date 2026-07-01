import type { Request, Response } from "express";
import { env } from "../config/env";
import { UserModel } from "../models/User";
import type { LoginInput, RegisterInput } from "../schemas/authSchemas";
import { AppError, asyncHandler } from "../utils/http";
import { signToken } from "../utils/jwt";

function serializeUser(user: { _id: unknown; name: string; email: string; role: "user" | "admin" }) {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role
  };
}

export const register = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as RegisterInput;

  if (input.role === "admin" && input.adminCode !== env.ADMIN_INVITE_CODE) {
    throw new AppError("A valid admin invite code is required to create an admin account.", 403);
  }

  const existingUser = await UserModel.findOne({ email: input.email });
  if (existingUser) {
    throw new AppError("An account with this email already exists.", 409);
  }

  const user = await UserModel.create({
    name: input.name,
    email: input.email,
    password: input.password,
    role: input.role ?? "user"
  });

  const safeUser = serializeUser(user);
  const token = signToken(safeUser);

  res.status(201).json({
    user: safeUser,
    token
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as LoginInput;
  const user = await UserModel.findOne({ email: input.email }).select("+password");

  if (!user || !(await user.comparePassword(input.password))) {
    throw new AppError("Invalid email or password.", 401);
  }

  const safeUser = serializeUser(user);
  const token = signToken(safeUser);

  res.json({
    user: safeUser,
    token
  });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("Authentication required.", 401);
  }

  const user = await UserModel.findById(req.user.id);
  if (!user) {
    throw new AppError("User not found.", 404);
  }

  res.json({
    user: serializeUser(user)
  });
});
