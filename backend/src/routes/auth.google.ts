import { Router } from 'express';
import {
  initiateGoogleAuth,
  googleAuthCallback,
} from '../controllers/authController.js';
import { oauthRateLimit } from '../middleware/rateLimit.js';

const router = Router();

// Google OAuth routes
router.get('/google', oauthRateLimit, initiateGoogleAuth);
router.get('/google/callback', oauthRateLimit, googleAuthCallback);
router.post('/google/callback', oauthRateLimit, googleAuthCallback); // Add POST endpoint for inline flow

export default router;
