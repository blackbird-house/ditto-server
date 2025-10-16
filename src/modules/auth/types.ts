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
  refreshToken: string;
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

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  token: string;
  refreshToken: string;
}

export interface OtpService {
  sendOtp(phone: string): Promise<{ otpId: string; otp: string }>;
  verifyOtp(phone: string, otp: string, otpId: string): Promise<boolean>;
}

export interface SocialAuthRequest {
  provider: 'google' | 'apple';
  token: string;
}

export interface SocialAuthResponse {
  token: string;
  refreshToken: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    authProvider: string;
    profilePictureUrl?: string;
  };
}

export interface SocialUserInfo {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePictureUrl?: string;
}

export interface AuthService {
  sendOtp(phone: string): Promise<void>;
  verifyOtp(phone: string, otp: string): Promise<VerifyOtpResponse>;
  refreshToken(refreshToken: string): Promise<RefreshTokenResponse>;
  generateToken(userId: string, phone: string): string;
  generateRefreshToken(userId: string, phone: string): string;
  verifyToken(token: string): AuthToken | null;
  verifyRefreshToken(refreshToken: string): AuthToken | null;
  getMe(userId: string): Promise<{ id: string; phone?: string; firstName?: string; lastName?: string; email?: string; authProvider?: string; createdAt: string; updatedAt: string } | null>;
  authenticateSocial(provider: 'google' | 'apple', token: string): Promise<SocialAuthResponse>;
}
