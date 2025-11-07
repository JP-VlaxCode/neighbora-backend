import { Request, Response, NextFunction } from 'express';
import { admin } from '../config/firebaseAdmin';

export interface AuthRequest extends Request {
  user?: {
    uid: string;
    email?: string;
    name?: string;
    role?: string;
  };
}

/**
 * Middleware to verify Firebase token
 */
export const verifyToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Authentication token not provided'
      });
      return;
    }

    const token = authHeader.split('Bearer ')[1];

    // Verify token with Firebase Admin
    const decodedToken = await admin.auth().verifyIdToken(token);

    // Add user information to request
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name,
      role: decodedToken.role || 'user'
    };

    next();
  } catch (error: any) {
    console.error('Error verifying token:', error);
    
    if (error.code === 'auth/id-token-expired') {
      res.status(401).json({
        success: false,
        message: 'Token expired'
      });
      return;
    }

    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

/**
 * Middleware to verify user is admin
 */
export const requireAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    // Get user custom claims
    const userRecord = await admin.auth().getUser(req.user.uid);
    const customClaims = userRecord.customClaims || {};

    if (!customClaims.admin && !customClaims.superadmin) {
      res.status(403).json({
        success: false,
        message: 'Access denied. Admin permissions required'
      });
      return;
    }

    // Update role in request
    req.user.role = customClaims.superadmin ? 'superadmin' : 'admin';

    next();
  } catch (error) {
    console.error('Error verifying admin permissions:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying permissions'
    });
  }
};

/**
 * Middleware to verify user has access to condominium
 */
export const requireCondominiumAccess = (condominiumIdParam: string = 'condominiumId') => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      const condominiumId = req.params[condominiumIdParam] || req.body.condominiumId;

      if (!condominiumId) {
        res.status(400).json({
          success: false,
          message: 'Condominium ID not provided'
        });
        return;
      }

      // TODO: Verify user has access to this condominium
      // This would check in database if user is admin/resident of this condominium

      next();
    } catch (error) {
      console.error('Error verifying condominium access:', error);
      res.status(500).json({
        success: false,
        message: 'Error verifying access'
      });
    }
  };
};
