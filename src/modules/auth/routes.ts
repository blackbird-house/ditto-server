import { Router } from 'express';
import { sendOtp, verifyOtp } from './controller';

const router = Router();

// POST /auth/send-otp - Send OTP to phone number
router.post('/send-otp', sendOtp);

// POST /auth/verify-otp - Verify OTP and get authentication token
router.post('/verify-otp', verifyOtp);

export default router;
