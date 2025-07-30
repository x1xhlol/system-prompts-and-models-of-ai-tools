import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Logger } from '../utils/logger';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    permissions: string[];
  };
}

const logger = new Logger('AuthMiddleware');

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.warn('Missing or invalid authorization header');
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    if (!decoded) {
      logger.warn('Invalid token provided');
      res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
      return;
    }

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role || 'user',
      permissions: decoded.permissions || []
    };

    logger.info('User authenticated', { userId: req.user.id, email: req.user.email });
    next();
  } catch (error: any) {
    logger.error('Authentication error', { error: error.message });
    res.status(401).json({
      success: false,
      error: 'Authentication failed'
    });
  }
}

export function optionalAuthMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // Continue without authentication
      next();
      return;
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    if (decoded) {
      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role || 'user',
        permissions: decoded.permissions || []
      };
      logger.info('Optional authentication successful', { userId: req.user.id });
    }

    next();
  } catch (error: any) {
    logger.warn('Optional authentication failed', { error: error.message });
    // Continue without authentication
    next();
  }
}

export function requireRole(roles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      logger.warn('Insufficient role', { 
        userRole: req.user.role, 
        requiredRoles: roles,
        userId: req.user.id 
      });
      res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
      return;
    }

    next();
  };
}

export function requirePermission(permissions: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }

    const hasPermission = permissions.some(permission => 
      req.user!.permissions.includes(permission)
    );

    if (!hasPermission) {
      logger.warn('Insufficient permissions', { 
        userPermissions: req.user.permissions, 
        requiredPermissions: permissions,
        userId: req.user.id 
      });
      res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
      return;
    }

    next();
  };
}

export function rateLimitByUser(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  // This would implement user-specific rate limiting
  // For now, we'll just pass through
  next();
}

export function generateToken(user: {
  id: string;
  email: string;
  role?: string;
  permissions?: string[];
}): string {
  const secret = process.env.JWT_SECRET || 'nowhere-secret-key';
  
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role || 'user',
      permissions: user.permissions || []
    },
    secret,
    { expiresIn: '24h' }
  );
}

export function verifyToken(token: string): any {
  try {
    const secret = process.env.JWT_SECRET || 'nowhere-secret-key';
    return jwt.verify(token, secret);
  } catch (error) {
    logger.error('Token verification failed', { error: (error as Error).message });
    return null;
  }
}

// Mock user data for development
export const mockUsers = [
  {
    id: 'user-1',
    email: 'user@example.com',
    role: 'user',
    permissions: ['read', 'write']
  },
  {
    id: 'admin-1',
    email: 'admin@example.com',
    role: 'admin',
    permissions: ['read', 'write', 'delete', 'admin']
  }
];

export function generateMockToken(userId: string): string {
  const user = mockUsers.find(u => u.id === userId);
  if (!user) {
    throw new Error('User not found');
  }
  
  return generateToken(user);
} 