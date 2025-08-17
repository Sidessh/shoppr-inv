import { Response } from 'express';
import logger from './logger.js';

// Cookie configuration
const COOKIE_SECRET = process.env.COOKIE_SECRET!;
const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN || 'localhost';
const COOKIE_SECURE = process.env.COOKIE_SECURE === 'true';
const NODE_ENV = process.env.NODE_ENV || 'development';

if (!COOKIE_SECRET) {
  throw new Error('Cookie secret is not configured');
}

// Cookie options
const getCookieOptions = (isHttpOnly: boolean = true) => ({
  httpOnly: isHttpOnly,
  secure: COOKIE_SECURE,
  sameSite: 'strict' as const,
  domain: COOKIE_DOMAIN,
  path: '/',
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
});

// Access token cookie options (shorter expiry)
const getAccessTokenCookieOptions = () => ({
  httpOnly: true,
  secure: COOKIE_SECURE,
  sameSite: 'strict' as const,
  domain: COOKIE_DOMAIN,
  path: '/',
  maxAge: 15 * 60 * 1000, // 15 minutes
});

// Set access token cookie
export const setAccessTokenCookie = (res: Response, token: string): void => {
  res.cookie('accessToken', token, getAccessTokenCookieOptions());
  logger.debug('Access token cookie set');
};

// Set refresh token cookie
export const setRefreshTokenCookie = (res: Response, token: string): void => {
  res.cookie('refreshToken', token, getCookieOptions());
  logger.debug('Refresh token cookie set');
};

// Clear access token cookie
export const clearAccessTokenCookie = (res: Response): void => {
  res.clearCookie('accessToken', {
    httpOnly: true,
    secure: COOKIE_SECURE,
    sameSite: 'strict',
    domain: COOKIE_DOMAIN,
    path: '/',
  });
  logger.debug('Access token cookie cleared');
};

// Clear refresh token cookie
export const clearRefreshTokenCookie = (res: Response): void => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: COOKIE_SECURE,
    sameSite: 'strict',
    domain: COOKIE_DOMAIN,
    path: '/',
  });
  logger.debug('Refresh token cookie cleared');
};

// Clear all auth cookies
export const clearAuthCookies = (res: Response): void => {
  clearAccessTokenCookie(res);
  clearRefreshTokenCookie(res);
  logger.debug('All auth cookies cleared');
};

// Set user session cookie (for frontend use)
export const setUserSessionCookie = (res: Response, userData: any): void => {
  res.cookie('userSession', JSON.stringify(userData), {
    httpOnly: false, // Allow frontend access
    secure: COOKIE_SECURE,
    sameSite: 'strict',
    domain: COOKIE_DOMAIN,
    path: '/',
    maxAge: 15 * 60 * 1000, // 15 minutes
  });
  logger.debug('User session cookie set');
};

// Clear user session cookie
export const clearUserSessionCookie = (res: Response): void => {
  res.clearCookie('userSession', {
    httpOnly: false,
    secure: COOKIE_SECURE,
    sameSite: 'strict',
    domain: COOKIE_DOMAIN,
    path: '/',
  });
  logger.debug('User session cookie cleared');
};

// Set OAuth state cookie
export const setOAuthStateCookie = (res: Response, state: string): void => {
  res.cookie('oauthState', state, {
    httpOnly: true,
    secure: COOKIE_SECURE,
    sameSite: 'strict',
    domain: COOKIE_DOMAIN,
    path: '/',
    maxAge: 10 * 60 * 1000, // 10 minutes
  });
  logger.debug('OAuth state cookie set');
};

// Clear OAuth state cookie
export const clearOAuthStateCookie = (res: Response): void => {
  res.clearCookie('oauthState', {
    httpOnly: true,
    secure: COOKIE_SECURE,
    sameSite: 'strict',
    domain: COOKIE_DOMAIN,
    path: '/',
  });
  logger.debug('OAuth state cookie cleared');
};

// Get cookie options for different environments
export const getCookieOptionsForEnv = () => {
  const baseOptions = {
    httpOnly: true,
    sameSite: 'strict' as const,
    path: '/',
  };

  if (NODE_ENV === 'production') {
    return {
      ...baseOptions,
      secure: true,
      domain: COOKIE_DOMAIN,
    };
  }

  return {
    ...baseOptions,
    secure: false,
    domain: 'localhost',
  };
};
