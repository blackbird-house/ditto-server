import { Router } from 'express';
import { sendOtp, verifyOtp, refreshToken, socialAuth } from './controller';

const router = Router();

// POST /auth/send-otp - Send OTP to phone number
router.post('/send-otp', sendOtp);

// POST /auth/verify-otp - Verify OTP and get authentication token
router.post('/verify-otp', verifyOtp);

// POST /auth/refresh-token - Refresh authentication token using refresh token
router.post('/refresh-token', refreshToken);

// POST /auth/social - Authenticate with social providers (Google, Apple)
router.post('/social', socialAuth);

export default router;
