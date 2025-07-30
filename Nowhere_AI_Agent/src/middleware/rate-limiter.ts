import { Request, Response, NextFunction } from 'express';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import Redis from 'redis';
import { Logger } from '../utils/logger';

const logger = new Logger('RateLimiter');

// In-memory rate limiter for development (fallback)
class MemoryRateLimiter {
  private requests: Map<string, number[]> = new Map();
  private windowMs: number;
  private maxRequests: number;

  constructor(windowMs: number = 60000, maxRequests: number = 100) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  isAllowed(key: string): boolean {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    if (!this.requests.has(key)) {
      this.requests.set(key, [now]);
      return true;
    }

    const requests = this.requests.get(key)!;
    const recentRequests = requests.filter(time => time > windowStart);
    
    if (recentRequests.length >= this.maxRequests) {
      return false;
    }

    recentRequests.push(now);
    this.requests.set(key, recentRequests);
    return true;
  }

  getRemaining(key: string): number {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    if (!this.requests.has(key)) {
      return this.maxRequests;
    }

    const requests = this.requests.get(key)!;
    const recentRequests = requests.filter(time => time > windowStart);
    
    return Math.max(0, this.maxRequests - recentRequests.length);
  }
}

// Create rate limiters
const generalLimiter = new MemoryRateLimiter(60000, 100); // 100 requests per minute
const voiceLimiter = new MemoryRateLimiter(60000, 20); // 20 voice requests per minute
const authLimiter = new MemoryRateLimiter(300000, 5); // 5 auth attempts per 5 minutes

export function rateLimiter(req: Request, res: Response, next: NextFunction): void {
  const key = req.ip || 'unknown';
  
  if (!generalLimiter.isAllowed(key)) {
    logger.warn('Rate limit exceeded', { ip: req.ip, url: req.url });
    res.status(429).json({
      success: false,
      error: 'Too many requests',
      retryAfter: 60
    });
    return;
  }

  // Add rate limit headers
  res.setHeader('X-RateLimit-Limit', '100');
  res.setHeader('X-RateLimit-Remaining', generalLimiter.getRemaining(key).toString());
  res.setHeader('X-RateLimit-Reset', new Date(Date.now() + 60000).toISOString());

  next();
}

export function voiceRateLimiter(req: Request, res: Response, next: NextFunction): void {
  const key = req.ip || 'unknown';
  
  if (!voiceLimiter.isAllowed(key)) {
    logger.warn('Voice rate limit exceeded', { ip: req.ip, url: req.url });
    res.status(429).json({
      success: false,
      error: 'Voice rate limit exceeded',
      retryAfter: 60
    });
    return;
  }

  // Add rate limit headers
  res.setHeader('X-RateLimit-Limit', '20');
  res.setHeader('X-RateLimit-Remaining', voiceLimiter.getRemaining(key).toString());
  res.setHeader('X-RateLimit-Reset', new Date(Date.now() + 60000).toISOString());

  next();
}

export function authRateLimiter(req: Request, res: Response, next: NextFunction): void {
  const key = req.ip || 'unknown';
  
  if (!authLimiter.isAllowed(key)) {
    logger.warn('Auth rate limit exceeded', { ip: req.ip, url: req.url });
    res.status(429).json({
      success: false,
      error: 'Too many authentication attempts',
      retryAfter: 300
    });
    return;
  }

  // Add rate limit headers
  res.setHeader('X-RateLimit-Limit', '5');
  res.setHeader('X-RateLimit-Remaining', authLimiter.getRemaining(key).toString());
  res.setHeader('X-RateLimit-Reset', new Date(Date.now() + 300000).toISOString());

  next();
}

// Redis-based rate limiter for production
export async function createRedisRateLimiter(): Promise<RateLimiterRedis | null> {
  try {
    const redisClient = Redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });

    await redisClient.connect();

    const rateLimiter = new RateLimiterRedis({
      storeClient: redisClient,
      keyPrefix: 'nowhere_rate_limit',
      points: 100, // Number of requests
      duration: 60, // Per 60 seconds
    });

    logger.info('Redis rate limiter initialized');
    return rateLimiter;
  } catch (error) {
    logger.warn('Failed to initialize Redis rate limiter, using memory fallback', { error: (error as Error).message });
    return null;
  }
}

// Advanced rate limiting with different rules for different endpoints
export function createAdvancedRateLimiter() {
  return (req: Request, res: Response, next: NextFunction) => {
    const path = req.path;
    const method = req.method;
    
    // Different limits for different endpoints
    if (path.includes('/voice')) {
      return voiceRateLimiter(req, res, next);
    }
    
    if (path.includes('/auth') || path.includes('/login')) {
      return authRateLimiter(req, res, next);
    }
    
    // Default rate limiting
    return rateLimiter(req, res, next);
  };
}

// Rate limiting for specific users (when authenticated)
export function userRateLimiter(req: any, res: Response, next: NextFunction): void {
  if (!req.user) {
    // Fall back to IP-based limiting for unauthenticated users
    return rateLimiter(req, res, next);
  }

  const key = `user:${req.user.id}`;
  
  if (!generalLimiter.isAllowed(key)) {
    logger.warn('User rate limit exceeded', { userId: req.user.id, url: req.url });
    res.status(429).json({
      success: false,
      error: 'User rate limit exceeded',
      retryAfter: 60
    });
    return;
  }

  // Add rate limit headers
  res.setHeader('X-RateLimit-Limit', '100');
  res.setHeader('X-RateLimit-Remaining', generalLimiter.getRemaining(key).toString());
  res.setHeader('X-RateLimit-Reset', new Date(Date.now() + 60000).toISOString());

  next();
} 