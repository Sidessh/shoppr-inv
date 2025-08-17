import { Router } from 'express';
import {
  register,
  login,
  refreshToken,
  logout,
  logoutAll,
  getProfile,
  healthCheck,
} from '../controllers/authController.js';
import { authenticate, requireCustomer, requireMerchant, requireRider } from '../middleware/auth.js';
import { authRateLimit, registrationRateLimit } from '../middleware/rateLimit.js';

const router = Router();

// Health check
router.get('/health', healthCheck);

// Authentication routes
router.post('/register', registrationRateLimit, register);
router.post('/login', authRateLimit, login);
router.post('/refresh', authRateLimit, refreshToken);
router.post('/logout', authenticate, logout);
router.post('/logout-all', authenticate, logoutAll);

// Profile routes
router.get('/me', authenticate, getProfile);

// Role-specific protected routes (examples)
router.get('/customer/profile', authenticate, requireCustomer, getProfile);
router.get('/merchant/profile', authenticate, requireMerchant, getProfile);
router.get('/rider/profile', authenticate, requireRider, getProfile);

export default router;
