import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Logger } from '../utils/logger';

const logger = new Logger('AuthMiddleware');

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email?: string;
    role?: string;
  };
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    // Skip authentication for public endpoints
    if (req.path.startsWith('/public')) {
      return next();
    }

    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // For development, allow requests without token
      if (process.env.NODE_ENV === 'development') {
        req.user = {
          id: 'default-user',
          email: 'dev@nowhere.ai',
          role: 'developer'
        };
        return next();
      }

      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const secret = process.env.JWT_SECRET || 'nowhere-secret-key';
    const decoded = jwt.verify(token, secret) as any;

    // Add user info to request
    req.user = {
      id: decoded.id || decoded.sub,
      email: decoded.email,
      role: decoded.role || 'user'
    };

    logger.debug('User authenticated', { 
      userId: req.user.id, 
      role: req.user.role 
    });

    next();

  } catch (error) {
    logger.error('Authentication failed', { error: error.message });

    // For development, allow requests with invalid tokens
    if (process.env.NODE_ENV === 'development') {
      req.user = {
        id: 'default-user',
        email: 'dev@nowhere.ai',
        role: 'developer'
      };
      return next();
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
}

/**
 * Generate JWT token for user
 */
export function generateToken(userId: string, email?: string, role?: string): string {
  const secret = process.env.JWT_SECRET || 'nowhere-secret-key';
  const payload = {
    id: userId,
    email,
    role: role || 'user',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
  };

  return jwt.sign(payload, secret);
}

/**
 * Verify token and return user info
 */
export function verifyToken(token: string): any {
  try {
    const secret = process.env.JWT_SECRET || 'nowhere-secret-key';
    return jwt.verify(token, secret);
  } catch (error) {
    throw new Error('Invalid token');
  }
} 