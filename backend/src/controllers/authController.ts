import { Request, Response } from 'express';
import { z } from 'zod';
import authService from '../services/authService.js';
import { setAccessTokenCookie, setRefreshTokenCookie, clearAuthCookies, setOAuthStateCookie, clearOAuthStateCookie } from '../utils/cookies.js';
import { UserRole } from '@prisma/client';
import { asyncHandler } from '../middleware/errorHandler.js';
import logger from '../utils/logger.js';

// Validation schemas
const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  role: z.enum(['CUSTOMER', 'MERCHANT', 'RIDER']),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
  role: z.enum(['CUSTOMER', 'MERCHANT', 'RIDER']),
});

// Register user
export const register = asyncHandler(async (req: Request, res: Response) => {
  // Validate request body
  const validatedData = registerSchema.parse(req.body);
  
  // Get user agent and IP
  const userAgent = req.get('User-Agent');
  const ipAddress = req.ip;

  // Register user
  const result = await authService.register(validatedData, userAgent, ipAddress);

  // Set cookies
  setAccessTokenCookie(res, result.accessToken!);
  setRefreshTokenCookie(res, result.accessToken!); // In a real app, you'd have the refresh token

  // Log successful registration
  logger.info('User registered successfully', {
    email: validatedData.email,
    role: validatedData.role,
    ip: ipAddress,
  });

  res.status(201).json({
    success: true,
    message: result.message,
    data: {
      user: result.user,
    },
  });
});

// Login user
export const login = asyncHandler(async (req: Request, res: Response) => {
  // Validate request body
  const validatedData = loginSchema.parse(req.body);
  
  // Get user agent and IP
  const userAgent = req.get('User-Agent');
  const ipAddress = req.ip;

  // Login user
  const result = await authService.login(validatedData, userAgent, ipAddress);

  // Set cookies
  setAccessTokenCookie(res, result.accessToken!);
  setRefreshTokenCookie(res, result.accessToken!); // In a real app, you'd have the refresh token

  // Log successful login
  logger.info('User logged in successfully', {
    email: validatedData.email,
    role: validatedData.role,
    ip: ipAddress,
  });

  res.status(200).json({
    success: true,
    message: result.message,
    data: {
      user: result.user,
    },
  });
});

// Google OAuth initiation
export const initiateGoogleAuth = asyncHandler(async (req: Request, res: Response) => {
  const { role } = req.query;

  if (!role) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'MISSING_PARAMETERS',
        message: 'Role is required',
      },
    });
  }

  if (!['CUSTOMER', 'MERCHANT', 'RIDER'].includes(role as string)) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_ROLE',
        message: 'Invalid role specified',
      },
    });
  }

  // Generate OAuth URL with default redirect to dashboard
  const redirectUrl = `${process.env.VITE_WEB_ORIGIN}/${(role as string).toLowerCase()}/dashboard`;
  const authUrl = await authService.generateGoogleAuthUrl(role as UserRole, redirectUrl);
  
  // Set OAuth state cookie
  const state = JSON.stringify({ role, redirectUrl });
  setOAuthStateCookie(res, state);

  // Log OAuth initiation
  logger.info('Google OAuth initiated', {
    role,
    redirectUrl,
    ip: req.ip,
  });

  // Redirect to Google OAuth URL
  res.redirect(authUrl);
});

// Google OAuth callback
export const googleAuthCallback = asyncHandler(async (req: Request, res: Response) => {
  // Handle both GET (query params) and POST (body) requests
  const code = req.query.code || req.body.code;
  const state = req.query.state || req.body.state;

  if (!code || !state) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'MISSING_PARAMETERS',
        message: 'Authorization code and state are required',
      },
    });
  }

  // Get user agent and IP
  const userAgent = req.get('User-Agent');
  const ipAddress = req.ip;

  // Process Google OAuth
  const result = await authService.googleAuth(code as string, state as string, userAgent, ipAddress);

  // Set cookies
  setAccessTokenCookie(res, result.accessToken!);
  setRefreshTokenCookie(res, result.accessToken!); // In a real app, you'd have the refresh token

  // Clear OAuth state cookie
  clearOAuthStateCookie(res);

  // Log successful OAuth
  logger.info('Google OAuth completed successfully', {
    email: result.user.email,
    role: result.user.role,
    ip: ipAddress,
  });

  // Check if this is a POST request (inline flow) or GET request (redirect flow)
  if (req.method === 'POST') {
    // Return JSON response for inline flow
    return res.status(200).json({
      success: true,
      message: 'Google OAuth completed successfully',
      data: {
        user: result.user,
        accessToken: result.accessToken,
      },
    });
  } else {
    // For full-page redirect flow, redirect directly to dashboard
    const redirectUrl = `${process.env.VITE_WEB_ORIGIN}/${result.user.role.toLowerCase()}/dashboard`;
    res.redirect(redirectUrl);
  }
});

// Refresh token
export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;

  if (!refreshToken) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'MISSING_REFRESH_TOKEN',
        message: 'Refresh token is required',
      },
    });
  }

  // Get user agent and IP
  const userAgent = req.get('User-Agent');
  const ipAddress = req.ip;

  // Refresh token
  const result = await authService.refreshToken(refreshToken, userAgent, ipAddress);

  // Set new cookies
  setAccessTokenCookie(res, result.accessToken!);
  setRefreshTokenCookie(res, result.accessToken!); // In a real app, you'd have the new refresh token

  // Log token refresh
  logger.info('Token refreshed successfully', {
    userId: result.user.id,
    ip: ipAddress,
  });

  res.status(200).json({
    success: true,
    message: result.message,
    data: {
      user: result.user,
    },
  });
});

// Logout
export const logout = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken;

  if (refreshToken) {
    await authService.logout(refreshToken);
  }

  // Clear cookies
  clearAuthCookies(res);

  // Log logout
  logger.info('User logged out', {
    userId: req.user?.id,
    ip: req.ip,
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});

// Logout all sessions
export const logoutAll = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required',
      },
    });
  }

  await authService.logoutAll(req.user.id);

  // Clear cookies
  clearAuthCookies(res);

  // Log logout all
  logger.info('User logged out from all sessions', {
    userId: req.user.id,
    ip: req.ip,
  });

  res.status(200).json({
    success: true,
    message: 'Logged out from all sessions successfully',
  });
});

// Get user profile
export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required',
      },
    });
  }

  const user = await authService.getProfile(req.user.id);

  res.status(200).json({
    success: true,
    message: 'Profile retrieved successfully',
    data: {
      user,
    },
  });
});

// Health check
export const healthCheck = asyncHandler(async (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Authentication service is healthy',
    data: {
      timestamp: new Date().toISOString(),
      service: 'auth',
      version: '1.0.0',
    },
  });
});
