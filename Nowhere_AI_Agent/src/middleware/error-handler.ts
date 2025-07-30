import { Request, Response, NextFunction } from 'express';
import { Logger } from '../utils/logger';

const logger = new Logger('ErrorHandler');

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  logger.error('Unhandled error', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Don't expose internal errors in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  const errorResponse = {
    success: false,
    error: isDevelopment ? error.message : 'Internal server error',
    ...(isDevelopment && { stack: error.stack })
  };

  res.status(500).json(errorResponse);
}

export function notFoundHandler(req: Request, res: Response): void {
  logger.warn('Route not found', {
    url: req.url,
    method: req.method,
    ip: req.ip
  });

  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.url,
    method: req.method
  });
}

export function validationErrorHandler(
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (error.name === 'ValidationError') {
    logger.warn('Validation error', {
      error: error.message,
      details: error.details,
      url: req.url,
      method: req.method
    });

    res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: error.details || error.message
    });
    return;
  }

  next(error);
}

export function rateLimitErrorHandler(
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (error.name === 'RateLimitError') {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      url: req.url,
      method: req.method
    });

    res.status(429).json({
      success: false,
      error: 'Too many requests',
      retryAfter: error.retryAfter || 60
    });
    return;
  }

  next(error);
}

export function asyncErrorHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
} 