import { Response } from 'express';
import { admin } from '../../../config/firebaseAdmin';
import type { AuthRequest } from '../../../middleware/auth';

/**
 * Login endpoint - Verifies Firebase ID token and returns user info
 * 
 * This endpoint expects the client to:
 * 1. Authenticate with Firebase SDK (email + password)
 * 2. Get the ID token from Firebase
 * 3. Send the token to this endpoint
 * 
 * The backend then verifies the token and returns user info
 */
export const login = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { idToken } = req.body;

    // Validate input
    if (!idToken) {
      res.status(400).json({
        success: false,
        message: 'idToken is required. Please authenticate with Firebase first.'
      });
      return;
    }

    console.log('🔐 Login attempt with Firebase token');

    // Verify the token with Firebase Admin SDK
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    console.log('✅ Token verified for user:', decodedToken.email);

    // Get full user record from Firebase
    const userRecord = await admin.auth().getUser(decodedToken.uid);

    res.json({
      success: true,
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName || undefined,
        photoURL: userRecord.photoURL || undefined,
        emailVerified: userRecord.emailVerified,
        createdAt: userRecord.metadata.creationTime
      }
    });
  } catch (error: any) {
    console.error('❌ Login error:', error.message);
    
    if (error.code === 'auth/argument-error') {
      res.status(401).json({
        success: false,
        message: 'Invalid token format'
      });
      return;
    }

    if (error.code === 'auth/id-token-expired') {
      res.status(401).json({
        success: false,
        message: 'Token expired'
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};

/**
 * Verify token endpoint
 * Checks if the provided token is valid
 * Returns user information if token is valid
 */
export const verifyToken = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    console.log('✅ Token verified for user:', req.user.email);

    // Get full user record from Firebase for additional info
    const userRecord = await admin.auth().getUser(req.user.uid);

    res.json({
      success: true,
      message: 'Token is valid',
      user: {
        uid: req.user.uid,
        email: req.user.email,
        displayName: userRecord.displayName || undefined,
        photoURL: userRecord.photoURL || undefined,
        emailVerified: userRecord.emailVerified,
        createdAt: userRecord.metadata.creationTime
      }
    });
  } catch (error: any) {
    console.error('❌ Token verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Token verification failed',
      error: error.message
    });
  }
};

/**
 * Get current user information
 * Returns complete user profile from Firebase
 */
export const getCurrentUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    console.log('👤 Getting user info for:', req.user.email);

    // Get full user record from Firebase
    const userRecord = await admin.auth().getUser(req.user.uid);

    res.json({
      success: true,
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName || undefined,
        photoURL: userRecord.photoURL || undefined,
        emailVerified: userRecord.emailVerified,
        phoneNumber: userRecord.phoneNumber || undefined,
        disabled: userRecord.disabled,
        createdAt: userRecord.metadata.creationTime,
        lastSignInTime: userRecord.metadata.lastSignInTime
      }
    });
  } catch (error: any) {
    console.error('❌ Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get current user',
      error: error.message
    });
  }
};
