import { AuthService, VerifyOtpResponse, AuthToken } from '../types';
import { MockOtpService } from './mockOtpService';
import { userService } from '../../users/service';

export class AuthServiceImpl implements AuthService {
  private otpService: MockOtpService;
  private otpSessions: Map<string, { otpId: string; attempts: number; maxAttempts: number }> = new Map();

  constructor() {
    this.otpService = new MockOtpService();
    
    // Cleanup expired OTPs every 5 minutes
    setInterval(() => {
      this.otpService.cleanupExpiredOtps();
    }, 5 * 60 * 1000);
  }

  async sendOtp(phone: string): Promise<void> {
    // Validate phone number format (basic validation)
    if (!this.isValidPhoneNumber(phone)) {
      throw new Error('Invalid phone number format');
    }

    // Check rate limiting (max 3 OTP requests per phone per hour)
    const sessionKey = `otp_${phone}`;
    const existingSession = this.otpSessions.get(sessionKey);
    
    if (existingSession && existingSession.attempts >= 3) {
      throw new Error('Too many OTP requests. Please try again later.');
    }

    try {
      const { otpId } = await this.otpService.sendOtp(phone);
      
      // Track OTP session
      this.otpSessions.set(sessionKey, {
        otpId,
        attempts: existingSession ? existingSession.attempts + 1 : 1,
        maxAttempts: 3
      });

      // No return value - 204 No Content response
    } catch (error) {
      throw new Error('Failed to send OTP');
    }
  }

  async verifyOtp(phone: string, otp: string): Promise<VerifyOtpResponse> {
    const sessionKey = `otp_${phone}`;
    const session = this.otpSessions.get(sessionKey);
    
    if (!session) {
      throw new Error('No OTP session found. Please request a new OTP.');
    }

    try {
      const isValid = await this.otpService.verifyOtp(phone, otp, session.otpId);
      
      if (!isValid) {
        throw new Error('Invalid or expired OTP');
      }

      // OTP is valid, find user
      const user = this.findUserByPhone(phone);
      
      if (!user) {
        // User not found - return 404 error
        throw new Error('User not found');
      }

      // Generate JWT token
      const token = this.generateToken(user.id, phone);

      // Clean up OTP session
      this.otpSessions.delete(sessionKey);

      return {
        token
      };
    } catch (error) {
      throw error;
    }
  }

  generateToken(userId: string, phone: string): string {
    // Simple token generation (in production, use proper JWT)
    const payload = {
      userId,
      phone,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (5 * 60) // 5 minutes
    };

    // For now, return a simple base64 encoded token
    // In production, use jsonwebtoken library
    return Buffer.from(JSON.stringify(payload)).toString('base64');
  }

  verifyToken(token: string): AuthToken | null {
    try {
      const payload = JSON.parse(Buffer.from(token, 'base64').toString());
      
      // Check expiration
      if (payload.exp < Math.floor(Date.now() / 1000)) {
        return null;
      }

      return payload as AuthToken;
    } catch (error) {
      return null;
    }
  }

  private isValidPhoneNumber(phone: string): boolean {
    // Basic phone number validation (international format)
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    return phoneRegex.test(phone);
  }

  async getMe(userId: string): Promise<{ id: string; phone: string; firstName?: string; lastName?: string; email?: string; createdAt: string; updatedAt: string } | null> {
    try {
      const user = userService.getUserById(userId);
      if (!user) {
        return null;
      }

      return {
        id: user.id,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString()
      };
    } catch (error) {
      return null;
    }
  }

  private findUserByPhone(phone: string) {
    // Find user by phone number in the user service
    // This is a simple implementation - in production, add a method to userService
    const allUsers = (userService as any).getAllUsers();
    return allUsers.find((user: any) => user.phone === phone);
  }
}

export const authService = new AuthServiceImpl();
