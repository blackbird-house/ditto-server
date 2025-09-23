import { Request, Response } from 'express';
import { authService } from './services/authService';

export const sendOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone } = req.body;

    if (!phone) {
      res.status(400).json({
        error: 'Bad request',
        message: 'Phone number is required'
      });
      return;
    }

    await authService.sendOtp(phone);
    res.status(204).send();
  } catch (error: any) {
    if (error.message === 'Invalid phone number format') {
      res.status(400).json({
        error: 'Invalid phone number',
        message: 'Please provide a valid phone number in international format (e.g., +1234567890)'
      });
    } else {
      console.error('Error sending OTP:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to send OTP'
      });
    }
  }
};

export const verifyOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      res.status(400).json({
        error: 'Bad request',
        message: 'Phone number and OTP are required'
      });
      return;
    }

    const result = await authService.verifyOtp(phone, otp);
    res.status(200).json(result);
  } catch (error: any) {
    if (error.message === 'No OTP session found. Please request a new OTP.') {
      res.status(400).json({
        error: 'No OTP session',
        message: error.message
      });
    } else if (error.message === 'Invalid or expired OTP') {
      res.status(400).json({
        error: 'Invalid OTP',
        message: error.message
      });
    } else if (error.message === 'User not found') {
      res.status(404).json({
        error: 'Not found',
        message: 'User not found'
      });
    } else {
      console.error('Error verifying OTP:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to verify OTP'
      });
    }
  }
};

