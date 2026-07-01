import type { NextFunction, Request, Response } from "express";
import type { UserRole } from "../models/User";
import { AppError } from "../utils/http";

export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      next(new AppError("Authentication required.", 401));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(new AppError("You do not have permission to access this resource.", 403));
      return;
    }

    next();
  };
}
