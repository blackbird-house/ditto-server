import { OtpService } from '../types';
import { randomUUID, randomInt } from 'crypto';

/**
 * Mock OTP Service for Development
 *
 * This service simulates OTP functionality without sending real SMS.
 * In development, OTP codes are logged to the console for testing.
 *
 * For production, replace this with a real service like Twilio.
 */
export class MockOtpService implements OtpService {
  private otpStore: Map<string, { otp: string; expiresAt: Date }> = new Map();

  async sendOtp(phone: string): Promise<{ otpId: string; otp: string }> {
    // Generate cryptographically secure 6-digit OTP
    // In test and development environments, use a deterministic approach for easier testing
    const otp =
      process.env['NODE_ENV'] === 'test' ||
      process.env['NODE_ENV'] === 'development'
        ? phone.slice(-6) // Use last 6 digits for testing/development
        : randomInt(100000, 999999).toString(); // Use secure random for staging/production
    const otpId = randomUUID();

    // Store OTP with 5-minute expiration
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    this.otpStore.set(otpId, { otp, expiresAt });

    // In development, log the OTP to console (not in tests)
    if (process.env['NODE_ENV'] !== 'test') {
      console.log(
        `🔐 [MOCK OTP] Phone: ${phone} | OTP: ${otp} | Expires: ${expiresAt.toISOString()}`
      );
    }

    // For testing purposes, also store the OTP in a global variable
    (global as any).lastOtp = { phone, otp, otpId };

    return { otpId, otp };
  }

  async verifyOtp(phone: string, otp: string, otpId: string): Promise<boolean> {
    const stored = this.otpStore.get(otpId);

    if (!stored) {
      if (process.env['NODE_ENV'] !== 'test') {
        console.log(`❌ [MOCK OTP] No OTP found for ID: ${otpId}`);
      }
      return false;
    }

    if (new Date() > stored.expiresAt) {
      if (process.env['NODE_ENV'] !== 'test') {
        console.log(`⏰ [MOCK OTP] OTP expired for ID: ${otpId}`);
      }
      this.otpStore.delete(otpId);
      return false;
    }

    if (stored.otp !== otp) {
      if (process.env['NODE_ENV'] !== 'test') {
        console.log(
          `❌ [MOCK OTP] Invalid OTP for ID: ${otpId} (expected: ${stored.otp}, received: ${otp})`
        );
      }
      return false;
    }

    // OTP is valid, remove it from store
    this.otpStore.delete(otpId);
    if (process.env['NODE_ENV'] !== 'test') {
      console.log(
        `✅ [MOCK OTP] OTP verified successfully for phone: ${phone}`
      );
    }
    return true;
  }

  // Cleanup expired OTPs (call this periodically)
  cleanupExpiredOtps(): void {
    const now = new Date();
    for (const [otpId, stored] of this.otpStore.entries()) {
      if (now > stored.expiresAt) {
        this.otpStore.delete(otpId);
      }
    }
  }
}
