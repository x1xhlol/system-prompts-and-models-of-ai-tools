import { Request, Response, NextFunction } from 'express';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import Redis from 'redis';
import { Logger } from '../utils/logger';

const logger = new Logger('RateLimiter');

// Create Redis client for rate limiting
const redisClient = Redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

// Rate limiter configuration
const rateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'nowhere_rate_limit',
  points: 100, // Number of requests
  duration: 60, // Per 60 seconds
  blockDuration: 60 * 15, // Block for 15 minutes if limit exceeded
});

// Rate limiter middleware
export async function rateLimiterMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const key = req.ip || req.connection.remoteAddress || 'unknown';
    
    await rateLimiter.consume(key);
    next();
  } catch (rejRes) {
    const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
    
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path,
      remainingPoints: rejRes.remainingPoints,
      msBeforeNext: rejRes.msBeforeNext,
    });

    res.set('Retry-After', String(Math.round(secs / 60)));
    res.status(429).json({
      success: false,
      error: {
        message: 'Too many requests',
        retryAfter: secs,
      },
      timestamp: new Date().toISOString(),
    });
  }
}

// Special rate limiter for voice commands (more restrictive)
const voiceRateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'nowhere_voice_rate_limit',
  points: 50, // Fewer requests for voice
  duration: 60,
  blockDuration: 60 * 30, // Block for 30 minutes
});

export async function voiceRateLimiterMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const key = req.ip || req.connection.remoteAddress || 'unknown';
    
    await voiceRateLimiter.consume(key);
    next();
  } catch (rejRes) {
    const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
    
    logger.warn('Voice rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path,
      remainingPoints: rejRes.remainingPoints,
      msBeforeNext: rejRes.msBeforeNext,
    });

    res.set('Retry-After', String(Math.round(secs / 60)));
    res.status(429).json({
      success: false,
      error: {
        message: 'Too many voice requests',
        retryAfter: secs,
      },
      timestamp: new Date().toISOString(),
    });
  }
}

// Export the main rate limiter for general use
export const rateLimiter = rateLimiterMiddleware; 