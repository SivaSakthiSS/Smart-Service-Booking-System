import { Router } from 'express';
import {
  register,
  login,
  logout,
  getMe,
  getCsrfToken
} from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';
import { authRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// CSRF token retrieval
router.get('/csrf-token', getCsrfToken);

// Public Authentication endpoints with rate limiting
router.post('/register', authRateLimiter, register);
router.post('/login', authRateLimiter, login);

// Session termination
router.post('/logout', logout);

// Session restoration (protected)
router.get('/me', requireAuth, getMe);

export default router;
