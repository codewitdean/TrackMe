import type { ErrorRequestHandler, RequestHandler } from "express";
import { env } from "../config/env";
import { AppError } from "../utils/http";

export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
};

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  const statusCode = error instanceof AppError ? error.statusCode : 500;

  if (env.NODE_ENV !== "test") {
    console.error(error);
  }

  res.status(statusCode).json({
    message: error.message || "Something went wrong",
    stack: env.NODE_ENV === "development" ? error.stack : undefined
  });
};
