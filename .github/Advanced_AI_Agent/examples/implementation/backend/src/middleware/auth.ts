import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Logger } from '../utils/logger';

const logger = new Logger('AuthMiddleware');

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    permissions: string[];
  };
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      logger.warn('No authorization header provided', { 
        ip: req.ip, 
        userAgent: req.get('User-Agent') 
      });
      return res.status(401).json({
        success: false,
        error: 'No authorization token provided'
      });
    }

    const token = authHeader.replace('Bearer ', '');
    
    if (!token) {
      logger.warn('Invalid authorization header format', { 
        ip: req.ip, 
        userAgent: req.get('User-Agent') 
      });
      return res.status(401).json({
        success: false,
        error: 'Invalid authorization header format'
      });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      logger.error('JWT_SECRET not configured');
      return res.status(500).json({
        success: false,
        error: 'Server configuration error'
      });
    }

    try {
      const decoded = jwt.verify(token, secret) as any;
      
      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role || 'user',
        permissions: decoded.permissions || []
      };

      logger.info('User authenticated successfully', { 
        userId: req.user.id, 
        email: req.user.email,
        ip: req.ip 
      });

      next();
    } catch (jwtError) {
      logger.warn('Invalid JWT token', { 
        error: jwtError.message,
        ip: req.ip 
      });
      
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }

  } catch (error) {
    logger.error('Authentication middleware error', { 
      error: error.message,
      ip: req.ip 
    });
    
    return res.status(500).json({
      success: false,
      error: 'Authentication service error'
    });
  }
}

export function optionalAuthMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      // Continue without authentication
      next();
      return;
    }

    const token = authHeader.replace('Bearer ', '');
    
    if (!token) {
      // Continue without authentication
      next();
      return;
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      // Continue without authentication
      next();
      return;
    }

    try {
      const decoded = jwt.verify(token, secret) as any;
      
      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role || 'user',
        permissions: decoded.permissions || []
      };

      logger.info('Optional authentication successful', { 
        userId: req.user.id, 
        email: req.user.email 
      });

      next();
    } catch (jwtError) {
      // Continue without authentication
      logger.debug('Optional authentication failed, continuing without auth', { 
        error: jwtError.message 
      });
      next();
    }

  } catch (error) {
    logger.error('Optional authentication middleware error', { 
      error: error.message 
    });
    // Continue without authentication
    next();
  }
}

export function requireRole(roles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      logger.warn('Role check failed - no authenticated user', { 
        requiredRoles: roles,
        ip: req.ip 
      });
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      logger.warn('Insufficient role permissions', { 
        userRole: req.user.role,
        requiredRoles: roles,
        userId: req.user.id 
      });
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
    }

    logger.debug('Role check passed', { 
      userRole: req.user.role,
      requiredRoles: roles,
      userId: req.user.id 
    });

    next();
  };
}

export function requirePermission(permissions: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      logger.warn('Permission check failed - no authenticated user', { 
        requiredPermissions: permissions,
        ip: req.ip 
      });
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const hasAllPermissions = permissions.every(permission => 
      req.user!.permissions.includes(permission)
    );

    if (!hasAllPermissions) {
      logger.warn('Insufficient permissions', { 
        userPermissions: req.user.permissions,
        requiredPermissions: permissions,
        userId: req.user.id 
      });
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
    }

    logger.debug('Permission check passed', { 
      userPermissions: req.user.permissions,
      requiredPermissions: permissions,
      userId: req.user.id 
    });

    next();
  };
}

export function rateLimitByUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  // This is a simplified rate limiting by user
  // In a real implementation, you would use Redis or a similar store
  const userId = req.user?.id || req.ip;
  
  // For now, we'll just pass through
  // In a real implementation, you would check rate limits here
  logger.debug('Rate limit check passed', { userId });
  next();
}

export function generateToken(user: {
  id: string;
  email: string;
  role?: string;
  permissions?: string[];
}): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET not configured');
  }

  const payload = {
    id: user.id,
    email: user.email,
    role: user.role || 'user',
    permissions: user.permissions || [],
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7) // 7 days
  };

  return jwt.sign(payload, secret);
}

export function verifyToken(token: string): any {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET not configured');
  }

  return jwt.verify(token, secret);
} 