import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { AuthenticatedRequest, JwtPayload } from '../types';

// Verify JWT token and attach user to request
export const authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Try to get token from cookie first, then fallback to Authorization header
    let token = req.cookies['auth-token'];
    
    if (!token) {
      token = req.header('Authorization')?.replace('Bearer ', '');
    }
    
    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user || !user.isActive) {
      res.status(401).json({
        success: false,
        message: 'Invalid token or user account disabled.'
      });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token.'
    });
  }
};

// Role-based authorization middleware
export const authorize = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
      return;
    }

    next();
  };
};