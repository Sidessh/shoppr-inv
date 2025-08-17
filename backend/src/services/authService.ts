import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../config/database.js';
import { generateTokenPair, hashRefreshToken, verifyAccessToken, verifyRefreshToken } from '../utils/jwt.js';
import { generateGoogleAuthUrl, exchangeCodeForTokens, getGoogleUserInfo } from '../config/google.js';
import { UserRole, AuthProvider } from '@prisma/client';
import { RegisterRequest, LoginRequest, User, AuthResponse, OAuthState } from '../types/auth.js';
import logger from '../utils/logger.js';
import { logAuth } from '../utils/logger.js';

export class AuthService {
  // Register new user
  async register(data: RegisterRequest, userAgent?: string, ipAddress?: string): Promise<AuthResponse> {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email.toLowerCase() },
      });

      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Hash password
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(data.password, saltRounds);

      // Create user
      const user = await prisma.user.create({
        data: {
          email: data.email.toLowerCase(),
          name: data.name,
          passwordHash,
          role: data.role,
          emailVerified: false, // Will be verified via email or OAuth
        },
      });

      // Generate tokens
      const { accessToken, refreshToken, refreshTokenHash } = generateTokenPair(user);

      // Store refresh token
      await prisma.refreshToken.create({
        data: {
          userId: user.id,
          tokenHash: refreshTokenHash,
          userAgent,
          ipAddress,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        },
      });

      // Log authentication
      logAuth('user_registered', user.id, { role: data.role, method: 'email' });

      return {
        success: true,
        message: 'User registered successfully',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          emailVerified: user.emailVerified,
          lastLoginAt: user.lastLoginAt,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        accessToken,
      };
    } catch (error) {
      logger.error('Registration failed:', error);
      throw error;
    }
  }

  // Login user
  async login(data: LoginRequest, userAgent?: string, ipAddress?: string): Promise<AuthResponse> {
    try {
      // Find user
      const user = await prisma.user.findUnique({
        where: { email: data.email.toLowerCase() },
      });

      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Check role
      if (user.role !== data.role) {
        throw new Error('Invalid role for this account');
      }

      // Check if user has password (not OAuth-only)
      if (!user.passwordHash) {
        throw new Error('This account requires Google OAuth login');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(data.password, user.passwordHash);
      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });

      // Generate tokens
      const { accessToken, refreshToken, refreshTokenHash } = generateTokenPair(user);

      // Store refresh token
      await prisma.refreshToken.create({
        data: {
          userId: user.id,
          tokenHash: refreshTokenHash,
          userAgent,
          ipAddress,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        },
      });

      // Log authentication
      logAuth('user_logged_in', user.id, { role: data.role, method: 'email' });

      return {
        success: true,
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          emailVerified: user.emailVerified,
          lastLoginAt: user.lastLoginAt,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        accessToken,
      };
    } catch (error) {
      logger.error('Login failed:', error);
      throw error;
    }
  }

  // Google OAuth login
  async googleAuth(code: string, state: string, userAgent?: string, ipAddress?: string): Promise<AuthResponse> {
    try {
      // Parse state
      const oauthState: OAuthState = JSON.parse(state);
      const { role } = oauthState;

      // Exchange code for tokens
      const tokens = await exchangeCodeForTokens(code);
      if (!tokens.access_token) {
        throw new Error('Failed to get access token from Google');
      }

      // Get user info from Google
      const googleUserInfo = await getGoogleUserInfo(tokens.access_token) as any;
      
      // Log Google user info for debugging
      logger.info('Google user info received:', {
        email: googleUserInfo.email,
        name: googleUserInfo.name,
        sub: googleUserInfo.sub,
        id: googleUserInfo.id,
        email_verified: googleUserInfo.email_verified,
      });
      
      // Verify email is verified (Google accounts are typically verified)
      // Only check if the property exists and is explicitly false
      if (googleUserInfo.email_verified === false) {
        throw new Error('Google email must be verified');
      }
      
      // Ensure we have the required fields
      if (!googleUserInfo.email || !googleUserInfo.name) {
        throw new Error('Incomplete user information from Google');
      }
      
      // Use 'sub' as providerAccountId, fallback to 'id' if 'sub' is not available
      const providerAccountId = googleUserInfo.sub || googleUserInfo.id;
      if (!providerAccountId) {
        throw new Error('Unable to get unique identifier from Google');
      }

      // Check if user exists
      let user = await prisma.user.findUnique({
        where: { email: googleUserInfo.email.toLowerCase() },
        include: {
          providerAccounts: {
            where: { provider: AuthProvider.GOOGLE },
          },
        },
      });

      if (user) {
        // Check role
        if (user.role !== role) {
          throw new Error('Invalid role for this account');
        }

        // Update or create provider account
        if (user.providerAccounts.length === 0) {
          await prisma.providerAccount.create({
            data: {
              userId: user.id,
              provider: AuthProvider.GOOGLE,
              providerAccountId: providerAccountId,
              providerEmail: googleUserInfo.email,
              providerName: googleUserInfo.name,
              accessToken: tokens.access_token,
              refreshToken: tokens.refresh_token,
              expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
            },
          });
        } else {
          // Update existing provider account
          await prisma.providerAccount.update({
            where: { id: user.providerAccounts[0].id },
            data: {
              providerName: googleUserInfo.name,
              accessToken: tokens.access_token,
              refreshToken: tokens.refresh_token,
              expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
            },
          });
        }
      } else {
        // Create new user
        user = await prisma.user.create({
          data: {
            email: googleUserInfo.email.toLowerCase(),
            name: googleUserInfo.name,
            role,
            emailVerified: true, // Google emails are verified
            providerAccounts: {
              create: {
                provider: AuthProvider.GOOGLE,
                providerAccountId: providerAccountId,
                providerEmail: googleUserInfo.email,
                providerName: googleUserInfo.name,
                accessToken: tokens.access_token,
                refreshToken: tokens.refresh_token,
                expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
              },
            },
          },
          include: {
            providerAccounts: true,
          },
        });
      }

      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });

      // Generate tokens
      const { accessToken, refreshToken, refreshTokenHash } = generateTokenPair(user);

      // Store refresh token
      await prisma.refreshToken.create({
        data: {
          userId: user.id,
          tokenHash: refreshTokenHash,
          userAgent,
          ipAddress,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        },
      });

      // Log authentication
      logAuth('user_logged_in', user.id, { role, method: 'google' });

      return {
        success: true,
        message: 'Google OAuth login successful',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          emailVerified: user.emailVerified,
          lastLoginAt: user.lastLoginAt,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        accessToken,
      };
    } catch (error) {
      logger.error('Google OAuth failed:', error);
      throw error;
    }
  }

  // Refresh token
  async refreshToken(token: string, userAgent?: string, ipAddress?: string): Promise<AuthResponse> {
    try {
      // Verify refresh token
      const payload = verifyRefreshToken(token);
      
      // Check if token exists in database
      const tokenHash = hashRefreshToken(token);
      const refreshTokenRecord = await prisma.refreshToken.findUnique({
        where: { tokenHash },
        include: { user: true },
      });

      if (!refreshTokenRecord || refreshTokenRecord.isRevoked) {
        throw new Error('Invalid refresh token');
      }

      if (refreshTokenRecord.expiresAt < new Date()) {
        throw new Error('Refresh token expired');
      }

      // Revoke old token
      await prisma.refreshToken.update({
        where: { id: refreshTokenRecord.id },
        data: { isRevoked: true },
      });

      // Generate new tokens
      const { accessToken, refreshToken: newRefreshToken, refreshTokenHash: newRefreshTokenHash } = generateTokenPair(refreshTokenRecord.user);

      // Store new refresh token
      await prisma.refreshToken.create({
        data: {
          userId: refreshTokenRecord.user.id,
          tokenHash: newRefreshTokenHash,
          userAgent,
          ipAddress,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        },
      });

      // Log token refresh
      logAuth('token_refreshed', refreshTokenRecord.user.id);

      return {
        success: true,
        message: 'Token refreshed successfully',
        user: {
          id: refreshTokenRecord.user.id,
          email: refreshTokenRecord.user.email,
          name: refreshTokenRecord.user.name,
          role: refreshTokenRecord.user.role,
          emailVerified: refreshTokenRecord.user.emailVerified,
          lastLoginAt: refreshTokenRecord.user.lastLoginAt,
          createdAt: refreshTokenRecord.user.createdAt,
          updatedAt: refreshTokenRecord.user.updatedAt,
        },
        accessToken,
      };
    } catch (error) {
      logger.error('Token refresh failed:', error);
      throw error;
    }
  }

  // Logout (single session)
  async logout(token: string): Promise<void> {
    try {
      const tokenHash = hashRefreshToken(token);
      await prisma.refreshToken.updateMany({
        where: { tokenHash },
        data: { isRevoked: true },
      });
    } catch (error) {
      logger.error('Logout failed:', error);
      throw error;
    }
  }

  // Logout all sessions
  async logoutAll(userId: string): Promise<void> {
    try {
      await prisma.refreshToken.updateMany({
        where: { userId },
        data: { isRevoked: true },
      });
      
      logAuth('user_logged_out_all', userId);
    } catch (error) {
      logger.error('Logout all failed:', error);
      throw error;
    }
  }

  // Get user profile
  async getProfile(userId: string): Promise<User> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error('User not found');
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        emailVerified: user.emailVerified,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    } catch (error) {
      logger.error('Get profile failed:', error);
      throw error;
    }
  }

  // Generate Google OAuth URL
  async generateGoogleAuthUrl(role: UserRole, redirectUrl: string): Promise<string> {
    const state: OAuthState = {
      role,
      nonce: uuidv4(),
      redirectUrl,
    };
    
    // Use the configured Google redirect URI from environment
    const googleRedirectUri = process.env.GOOGLE_REDIRECT_URI;
    if (!googleRedirectUri) {
      throw new Error('GOOGLE_REDIRECT_URI is not configured');
    }
    
    // Create OAuth2Client with the configured redirect URI
    const { OAuth2Client } = await import('google-auth-library');
    const oauthClient = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      googleRedirectUri // Use the configured redirect URI
    );
    
    return oauthClient.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile',
      ],
      state: JSON.stringify(state),
      prompt: 'consent',
    });
  }
}

export default new AuthService();
