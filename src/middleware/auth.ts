import { Request, Response, NextFunction } from 'express';
import { admin } from '../config/firebaseAdmin';
import Admin from '../modules/admin/models/Admin';

export interface AuthRequest extends Request {
  user?: {
    uid: string;
    email?: string;
    name?: string;
    role?: string;
  };
  params: any;
  body: any;
  query: any;
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

    // Skip authentication if Firebase is not configured (development mode)
    if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      console.log('⚠️  Authentication skipped - Firebase not configured');
      
      // In development, use the token to extract UID if available
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split('Bearer ')[1];
        // Try to decode without verification (development only)
        try {
          const parts = token.split('.');
          if (parts.length === 3) {
            const decoded = JSON.parse(Buffer.from(parts[1], 'base64').toString());
            req.user = {
              uid: decoded.sub || decoded.uid || 'dev-user-123',
              email: decoded.email || 'dev@example.com',
              name: decoded.name || 'Development User',
              role: 'admin'
            };
            console.log('✅ Development mode - UID extracted from token:', req.user.uid);
            next();
            return;
          }
        } catch (e) {
          console.log('⚠️  Could not decode token, using default dev user');
        }
      }
      
      req.user = {
        uid: 'dev-user-123',
        email: 'dev@example.com',
        name: 'Development User',
        role: 'admin'
      };
      next();
      return;
    }

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
    console.error('❌ Error verifying token:', error.message || error);
    
    if (error.code === 'auth/id-token-expired') {
      res.status(401).json({
        success: false,
        message: 'Token expired'
      });
      return;
    }

    // Log more details for debugging
    if (error.code === 'auth/argument-error') {
      console.error('⚠️  Token format error - may be invalid or malformed');
    }

    res.status(401).json({
      success: false,
      message: 'Invalid token',
      error: error.code || error.message
    });
  }
};

/**
 * Middleware to verify user is admin (checks MongoDB)
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

    // Check MongoDB for admin status
    const adminRecord = await Admin.findOne({
      firebaseUid: req.user.uid,
      isActive: true
    });

    if (!adminRecord) {
      console.log('⚠️  User is not admin:', req.user.uid);
      res.status(403).json({
        success: false,
        message: 'Access denied. Admin permissions required'
      });
      return;
    }

    // Update role in request
    req.user.role = adminRecord.role;
    console.log('✅ Admin verified:', req.user.uid, 'Role:', adminRecord.role);

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
