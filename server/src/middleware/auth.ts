import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/http";
import { verifyToken } from "../utils/jwt";

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    next(new AppError("Authentication required. Please log in.", 401));
    return;
  }

  try {
    const token = header.replace("Bearer ", "");
    req.user = verifyToken(token);
    next();
  } catch {
    next(new AppError("Invalid or expired token. Please log in again.", 401));
  }
}
