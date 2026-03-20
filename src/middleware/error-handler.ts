import type { NextFunction, Request, Response } from "express";

import { AppError } from "../lib/errors.js";
import { logger } from "../lib/logger.js";

export const errorHandler = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (error instanceof AppError) {
    logger.warn(error.message, { details: error.details, statusCode: error.statusCode });
    return res.status(error.statusCode).json({
      error: error.message,
      details: error.details ?? null
    });
  }

  logger.error(error.message, { stack: error.stack });
  return res.status(500).json({
    error: "Internal server error"
  });
};
