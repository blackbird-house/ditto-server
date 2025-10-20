import {
  AuthService,
  VerifyOtpResponse,
  AuthToken,
  RefreshTokenResponse,
  SocialAuthResponse,
} from '../types';
import { MockOtpService } from './mockOtpService';
import { socialAuthService } from './socialAuthService';
import { userService } from '../../users/service';
import { databaseService } from '../../../database';
import jwt from 'jsonwebtoken';
import config from '../../../config';
import { randomUUID } from 'crypto';

/**
 * AUTH SERVICE - OTP BYPASS MODE
 *
 * ⚠️  TEMPORARY BYPASS ACTIVE ⚠️
 *
 * The OTP mechanism has been temporarily disabled. Users can now authenticate
 * by entering the last 6 digits of their phone number instead of a generated OTP.
 *
 * To re-enable OTP:
 * 1. Uncomment the original OTP logic in sendOtp() and verifyOtp() methods
 * 2. Remove the bypass validation logic
 * 3. Remove this comment block
 *
 * Current behavior:
 * - sendOtp(): Validates phone number but doesn't send actual OTP
 * - verifyOtp(): Accepts last 6 digits of phone number as valid code
 * - Lockout mechanism is still active for security
 */

export class AuthServiceImpl implements AuthService {
  private otpService: MockOtpService;
  // private otpSessions: Map<string, { otpId: string; attempts: number; maxAttempts: number }> = new Map(); // Commented out during OTP bypass
  private lockoutAttempts: Map<
    string,
    { attempts: number; lastAttempt: Date; lockedUntil?: Date }
  > = new Map();

  constructor() {
    this.otpService = new MockOtpService();

    // Cleanup expired OTPs every 5 minutes
    setInterval(
      () => {
        this.otpService.cleanupExpiredOtps();
      },
      5 * 60 * 1000
    );

    // Cleanup expired lockout attempts every 5 minutes
    setInterval(
      () => {
        const now = new Date();
        for (const [key, data] of this.lockoutAttempts.entries()) {
          if (data.lockedUntil && data.lockedUntil <= now) {
            this.lockoutAttempts.delete(key);
          }
        }
      },
      5 * 60 * 1000
    );
  }

  async sendOtp(phone: string): Promise<void> {
    // Validate phone number format (basic validation)
    if (!this.isValidPhoneNumber(phone)) {
      throw new Error('Invalid phone number format');
    }

    // TEMPORARY BYPASS: OTP mechanism is disabled
    // The sendOtp endpoint is kept functional but doesn't actually send OTPs
    // Users can authenticate by entering the last 6 digits of their phone number
    // TODO: Re-enable OTP mechanism when needed

    // ORIGINAL OTP LOGIC (COMMENTED OUT FOR BYPASS):
    // try {
    //   const { otpId } = await this.otpService.sendOtp(phone);
    //
    //   // Track OTP session
    //   const sessionKey = `otp_${phone}`;
    //   this.otpSessions.set(sessionKey, {
    //     otpId,
    //     attempts: 1,
    //     maxAttempts: 3
    //   });
    //
    //   // No return value - 204 No Content response
    // } catch (error) {
    //   throw new Error('Failed to send OTP');
    // }

    // BYPASS: Just validate phone and return success
    // No actual OTP is sent, users will use last 6 digits of phone number
    console.log(
      `🔐 [OTP BYPASS] Phone: ${phone} | Use last 6 digits: ${phone.slice(-6)}`
    );
  }

  async verifyOtp(phone: string, otp: string): Promise<VerifyOtpResponse> {
    // TEMPORARY BYPASS: OTP mechanism is disabled
    // Users can now authenticate by entering the last 6 digits of their phone number
    // TODO: Re-enable OTP mechanism when needed

    // Check for account lockout (keeping this for security)
    const lockoutKey = `lockout_${phone}`;
    const lockoutData = this.lockoutAttempts.get(lockoutKey);

    if (lockoutData?.lockedUntil && lockoutData.lockedUntil > new Date()) {
      const remainingTime = Math.ceil(
        (lockoutData.lockedUntil.getTime() - Date.now()) / 1000 / 60
      );
      throw new Error(
        `Account temporarily locked. Try again in ${remainingTime} minutes.`
      );
    }

    // BYPASS: Instead of checking OTP session, validate that the provided OTP matches last 6 digits
    const expectedOtp = phone.slice(-6);
    if (otp !== expectedOtp) {
      // Increment failed attempts and implement lockout
      const currentAttempts = (lockoutData?.attempts || 0) + 1;
      const maxAttempts = 5;
      const lockoutDuration = 15 * 60 * 1000; // 15 minutes

      if (currentAttempts >= maxAttempts) {
        const lockedUntil = new Date(Date.now() + lockoutDuration);
        this.lockoutAttempts.set(lockoutKey, {
          attempts: currentAttempts,
          lastAttempt: new Date(),
          lockedUntil,
        });
        throw new Error(
          `Too many failed attempts. Account locked for 15 minutes.`
        );
      } else {
        this.lockoutAttempts.set(lockoutKey, {
          attempts: currentAttempts,
          lastAttempt: new Date(),
        });
      }

      throw new Error(
        'Invalid code. Please enter the last 6 digits of your phone number.'
      );
    }

    // ORIGINAL OTP LOGIC (COMMENTED OUT FOR BYPASS):
    // const sessionKey = `otp_${phone}`;
    // const session = this.otpSessions.get(sessionKey);
    //
    // if (!session) {
    //   throw new Error('No OTP session found. Please request a new OTP.');
    // }
    //
    // try {
    //   const isValid = await this.otpService.verifyOtp(phone, otp, session.otpId);
    //
    //   if (!isValid) {
    //     // Increment failed attempts and implement lockout
    //     const currentAttempts = (lockoutData?.attempts || 0) + 1;
    //     const maxAttempts = 5;
    //     const lockoutDuration = 15 * 60 * 1000; // 15 minutes
    //
    //     if (currentAttempts >= maxAttempts) {
    //       const lockedUntil = new Date(Date.now() + lockoutDuration);
    //       this.lockoutAttempts.set(lockoutKey, {
    //         attempts: currentAttempts,
    //         lastAttempt: new Date(),
    //         lockedUntil
    //       });
    //       throw new Error(`Too many failed attempts. Account locked for 15 minutes.`);
    //     } else {
    //       this.lockoutAttempts.set(lockoutKey, {
    //         attempts: currentAttempts,
    //         lastAttempt: new Date()
    //       });
    //     }
    //
    //     throw new Error('Invalid or expired OTP');
    //   }

    // Code is valid, find user
    const user = await this.findUserByPhone(phone);

    if (!user) {
      // User not found - return 404 error
      throw new Error('User not found');
    }

    // Generate JWT token and refresh token
    const token = this.generateToken(user.id, phone);
    const refreshToken = this.generateRefreshToken(user.id, phone);

    // Clean up lockout attempts (no OTP session to clean up in bypass mode)
    this.lockoutAttempts.delete(lockoutKey);

    return {
      token,
      refreshToken,
    };
  }

  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    // Verify the refresh token
    const payload = this.verifyRefreshToken(refreshToken);

    if (!payload) {
      throw new Error('Invalid or expired refresh token');
    }

    // Check if the user still exists
    const user = await this.findUserByPhone(payload.phone);
    if (!user) {
      throw new Error('User not found');
    }

    // Generate new tokens
    const newToken = this.generateToken(user.id, payload.phone);
    const newRefreshToken = this.generateRefreshToken(user.id, payload.phone);

    return {
      token: newToken,
      refreshToken: newRefreshToken,
    };
  }

  generateToken(userId: string, phone: string): string {
    // Generate secure JWT token with proper signing
    const payload = {
      userId,
      phone,
      iat: Math.floor(Date.now() / 1000),
      jti: Math.random().toString(36).substring(2, 15), // Unique token identifier
    };

    // Use proper JWT with HMAC signing and configurable expiration
    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
      algorithm: 'HS256',
    } as jwt.SignOptions);
  }

  generateRefreshToken(userId: string, phone: string): string {
    // Generate refresh token with longer expiration (30 days)
    const payload = {
      userId,
      phone,
      type: 'refresh',
      iat: Math.floor(Date.now() / 1000),
      jti: Math.random().toString(36).substring(2, 15), // Unique token identifier
    };

    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.refreshExpiresIn,
      algorithm: 'HS256',
    } as jwt.SignOptions);
  }

  verifyToken(token: string): AuthToken | null {
    try {
      // Verify JWT token with proper signature validation
      const payload = jwt.verify(token, config.jwt.secret, {
        algorithms: ['HS256'],
      } as jwt.VerifyOptions) as any;

      return {
        userId: payload.userId,
        phone: payload.phone,
        iat: payload.iat,
        exp: payload.exp,
      };
    } catch (error) {
      // JWT verification failed (expired, invalid signature, etc.)
      return null;
    }
  }

  verifyRefreshToken(refreshToken: string): AuthToken | null {
    try {
      // Verify refresh token with proper signature validation
      const payload = jwt.verify(refreshToken, config.jwt.secret, {
        algorithms: ['HS256'],
      } as jwt.VerifyOptions) as any;

      // Ensure this is a refresh token
      if (payload.type !== 'refresh') {
        return null;
      }

      return {
        userId: payload.userId,
        phone: payload.phone,
        iat: payload.iat,
        exp: payload.exp,
      };
    } catch (error) {
      // JWT verification failed (expired, invalid signature, etc.)
      return null;
    }
  }

  private isValidPhoneNumber(phone: string): boolean {
    // Basic phone number validation (international format)
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    return phoneRegex.test(phone);
  }

  async getMe(
    userId: string
  ): Promise<{
    id: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    authProvider?: string;
    createdAt: string;
    updatedAt: string;
  } | null> {
    try {
      const user = await userService.getUserById(userId);
      if (!user) {
        return null;
      }

      return {
        id: user.id,
        ...(user.phone && { phone: user.phone }),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        ...(user.authProvider && { authProvider: user.authProvider }),
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      };
    } catch (error) {
      return null;
    }
  }

  private async findUserByPhone(phone: string) {
    // Find user by phone number using database service
    return await databaseService.getUserByPhone(phone);
  }

  async authenticateSocial(
    provider: 'google' | 'apple',
    token: string
  ): Promise<SocialAuthResponse> {
    try {
      // Verify the social token and get user info
      const socialUserInfo = await socialAuthService.verifySocialToken(
        provider,
        token
      );

      // Check if user already exists by social ID
      let user = await databaseService.getUserBySocialId(
        socialUserInfo.id,
        provider
      );

      if (!user) {
        // Check if user exists by email with same provider
        user = await databaseService.getUserByEmailAndProvider(
          socialUserInfo.email,
          provider
        );

        if (!user) {
          // Create new user
          const userId = randomUUID();
          await databaseService.createUser({
            id: userId,
            firstName: socialUserInfo.firstName,
            lastName: socialUserInfo.lastName,
            email: socialUserInfo.email,
            authProvider: provider,
            socialId: socialUserInfo.id,
            ...(socialUserInfo.profilePictureUrl && {
              profilePictureUrl: socialUserInfo.profilePictureUrl,
            }),
          });

          user = await databaseService.getUserById(userId);
        }
      }

      if (!user) {
        throw new Error('Failed to create or retrieve user');
      }

      // Generate tokens (use email as identifier for social auth users)
      const authToken = this.generateToken(user.id, user.email);
      const refreshToken = this.generateRefreshToken(user.id, user.email);

      return {
        token: authToken,
        refreshToken: refreshToken,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          authProvider: user.authProvider,
          ...(user.profilePictureUrl && {
            profilePictureUrl: user.profilePictureUrl,
          }),
        },
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Social authentication failed');
    }
  }
}

export const authService = new AuthServiceImpl();
