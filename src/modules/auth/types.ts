export interface SendOtpRequest {
  phone: string;
}

export interface SendOtpResponse {
  message: string;
  otpId?: string; // For tracking purposes
}

export interface VerifyOtpRequest {
  phone: string;
  otp: string;
}

export interface VerifyOtpResponse {
  message: string;
  token: string;
  user: {
    id: string;
    phone: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
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
  sendOtp(phone: string): Promise<SendOtpResponse>;
  verifyOtp(phone: string, otp: string): Promise<VerifyOtpResponse>;
  generateToken(userId: string, phone: string): string;
  verifyToken(token: string): AuthToken | null;
}
