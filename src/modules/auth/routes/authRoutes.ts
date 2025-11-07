import { Router } from 'express';
import { login, verifyToken, getCurrentUser } from '../controllers/authController';
import { verifyToken as verifyTokenMiddleware } from '../../../middleware/auth';

const router = Router();

/**
 * POST /auth/login
 * Login endpoint - returns information about how to authenticate
 * Note: Actual authentication is done on the client side with Firebase SDK
 */
router.post('/login', login);

/**
 * GET /auth/verify
 * Verify if the provided token is valid
 * Requires: Authorization header with Bearer token
 */
router.get('/verify', verifyTokenMiddleware, verifyToken);

/**
 * GET /auth/me
 * Get current user information
 * Requires: Authorization header with Bearer token
 */
router.get('/me', verifyTokenMiddleware, getCurrentUser);

export default router;
