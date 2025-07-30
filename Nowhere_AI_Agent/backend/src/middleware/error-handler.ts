import { Request, Response, NextFunction } from 'express';
import { Logger } from '../utils/logger';

const logger = new Logger('ErrorHandler');

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
  code?: string;
}

export function errorHandler(
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Log the error
  logger.error('Unhandled error', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Determine status code
  const statusCode = error.statusCode || 500;

  // Determine if it's an operational error
  const isOperational = error.isOperational || false;

  // Create error response
  const errorResponse = {
    success: false,
    message: error.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && {
      stack: error.stack,
      code: error.code
    }),
    timestamp: new Date().toISOString(),
    path: req.url,
    method: req.method
  };

  // Send response
  res.status(statusCode).json(errorResponse);

  // For non-operational errors, consider shutting down gracefully
  if (!isOperational && process.env.NODE_ENV === 'production') {
    logger.error('Non-operational error detected, shutting down gracefully');
    process.exit(1);
  }
}

/**
 * Create operational errors
 */
export class OperationalError extends Error implements AppError {
  public statusCode: number;
  public isOperational: boolean;
  public code: string;

  constructor(message: string, statusCode: number = 500, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.code = code || 'OPERATIONAL_ERROR';
    
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Create validation errors
 */
export class ValidationError extends OperationalError {
  constructor(message: string) {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

/**
 * Create authentication errors
 */
export class AuthenticationError extends OperationalError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

/**
 * Create authorization errors
 */
export class AuthorizationError extends OperationalError {
  constructor(message: string = 'Access denied') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

/**
 * Create not found errors
 */
export class NotFoundError extends OperationalError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND_ERROR');
  }
}

/**
 * Create rate limit errors
 */
export class RateLimitError extends OperationalError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 429, 'RATE_LIMIT_ERROR');
  }
}

/**
 * Async error wrapper
 */
export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
} 