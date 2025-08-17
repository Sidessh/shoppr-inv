import { OAuth2Client } from 'google-auth-library';
import logger from '../utils/logger.js';

// Google OAuth configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI) {
  logger.error('Missing Google OAuth configuration');
  throw new Error('Google OAuth configuration is incomplete');
}

// Create OAuth2 client
export const googleOAuthClient = new OAuth2Client(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI
);

// Google OAuth scopes
export const GOOGLE_SCOPES = [
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
];

// Google OAuth configuration object
export const googleConfig = {
  clientId: GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  redirectUri: GOOGLE_REDIRECT_URI,
  scopes: GOOGLE_SCOPES,
};

// Generate OAuth URL
export const generateGoogleAuthUrl = (state: string): string => {
  return googleOAuthClient.generateAuthUrl({
    access_type: 'offline',
    scope: GOOGLE_SCOPES,
    state: state,
    prompt: 'consent',
  });
};

// Verify Google ID token
export const verifyGoogleIdToken = async (idToken: string) => {
  try {
    const ticket = await googleOAuthClient.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    if (!payload) {
      throw new Error('Invalid Google ID token payload');
    }
    
    return payload;
  } catch (error) {
    logger.error('Google ID token verification failed:', error);
    throw new Error('Invalid Google ID token');
  }
};

// Exchange authorization code for tokens
export const exchangeCodeForTokens = async (code: string) => {
  try {
    const { tokens } = await googleOAuthClient.getToken(code);
    return tokens;
  } catch (error) {
    logger.error('Failed to exchange code for tokens:', error);
    throw new Error('Failed to exchange authorization code');
  }
};

// Get user info from Google
export const getGoogleUserInfo = async (accessToken: string) => {
  try {
    googleOAuthClient.setCredentials({ access_token: accessToken });
    
    const userInfoResponse = await googleOAuthClient.request({
      url: 'https://www.googleapis.com/oauth2/v2/userinfo',
    });
    
    return userInfoResponse.data;
  } catch (error) {
    logger.error('Failed to get Google user info:', error);
    throw new Error('Failed to get user information from Google');
  }
};

export default googleOAuthClient;
