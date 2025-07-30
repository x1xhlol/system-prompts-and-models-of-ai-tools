import { Request, Response, NextFunction } from 'express';
import { Logger } from '../utils/logger';

const logger = new Logger('ErrorHandler');

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export function errorHandler(
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  // Log the error
  logger.error('Error occurred', {
    error: {
      message: error.message,
      stack: error.stack,
      statusCode,
    },
    request: {
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: req.body,
      user: req.user,
    },
  });

  // Don't expose internal errors in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  const errorResponse = {
    success: false,
    error: {
      message: isDevelopment ? message : 'An error occurred',
      statusCode,
      ...(isDevelopment && { stack: error.stack }),
    },
    timestamp: new Date().toISOString(),
    path: req.path,
  };

  res.status(statusCode).json(errorResponse);
}

export function createError(
  message: string,
  statusCode: number = 500,
  isOperational: boolean = true
): AppError {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  error.isOperational = isOperational;
  return error;
}

export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
} 