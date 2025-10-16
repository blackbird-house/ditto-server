import { Request, Response } from 'express';
import { authService } from './services/authService';
import { logError } from '../../utils/logger';
import { SocialAuthRequest } from './types';

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
      logError('Auth', 'sendOtp', error, req);
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
    } else if (error.message === 'Invalid or expired OTP' || error.message === 'Invalid code. Please enter the last 6 digits of your phone number.') {
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
      logError('Auth', 'verifyOtp', error, req);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to verify OTP'
      });
    }
  }
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({
        error: 'Bad request',
        message: 'Refresh token is required'
      });
      return;
    }

    const result = await authService.refreshToken(refreshToken);
    res.status(200).json(result);
  } catch (error: any) {
    if (error.message === 'Invalid or expired refresh token') {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or expired refresh token. Please login again.'
      });
    } else if (error.message === 'User not found') {
      res.status(404).json({
        error: 'Not found',
        message: 'User not found'
      });
    } else {
      logError('Auth', 'refreshToken', error, req);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to refresh token'
      });
    }
  }
};

export const socialAuth = async (req: Request, res: Response): Promise<void> => {
  try {
    const { provider, token }: SocialAuthRequest = req.body;

    if (!provider || !token) {
      res.status(400).json({
        error: 'Bad request',
        message: 'Provider and token are required'
      });
      return;
    }

    if (provider !== 'google') {
      res.status(400).json({
        error: 'Bad request',
        message: 'Only Google Sign-In is currently supported'
      });
      return;
    }

    const result = await authService.authenticateSocial(provider, token);
    
    res.status(200).json(result);
  } catch (error: any) {
    if (error.message === 'Invalid Google token') {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid Google authentication token'
      });
    } else if (error.message === 'Apple Sign-In is not currently supported. Please use Google Sign-In.') {
      res.status(400).json({
        error: 'Bad request',
        message: 'Apple Sign-In is not currently supported. Please use Google Sign-In.'
      });
    } else if (error.message === 'Unsupported authentication provider. Only Google Sign-In is supported.') {
      res.status(400).json({
        error: 'Bad request',
        message: 'Unsupported authentication provider. Only Google Sign-In is supported.'
      });
    } else if (error.message === 'Social authentication failed') {
      res.status(500).json({
        error: 'Internal server error',
        message: 'Social authentication failed'
      });
    } else {
      logError('Auth', 'socialAuth', error, req);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to authenticate with social provider'
      });
    }
  }
};

