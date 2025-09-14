export interface SendOtpRequest {
  phone: string;
}

export interface SendOtpResponse {
  // No response body - returns 204 No Content
}

export interface VerifyOtpRequest {
  phone: string;
  otp: string;
}

export interface VerifyOtpResponse {
  token: string;
}

export interface OtpSession {
  id: string;
  phone: string;
  otp: string;
  expiresAt: Date;
  attempts: number;
  maxAttempts: number;
}

export interface AuthToken {
  userId: string;
  phone: string;
  iat: number;
  exp: number;
}

export interface OtpService {
  sendOtp(phone: string): Promise<{ otpId: string; otp: string }>;
  verifyOtp(phone: string, otp: string, otpId: string): Promise<boolean>;
}

export interface AuthService {
  sendOtp(phone: string): Promise<void>;
  verifyOtp(phone: string, otp: string): Promise<VerifyOtpResponse>;
  generateToken(userId: string, phone: string): string;
  verifyToken(token: string): AuthToken | null;
  getMe(userId: string): Promise<{ id: string; phone: string; firstName?: string; lastName?: string; email?: string; createdAt: string; updatedAt: string } | null>;
}
