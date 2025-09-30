import { Request, Response, NextFunction } from 'express';

/**
 * Input validation middleware
 * Validates and sanitizes common input fields
 */
export const inputValidationMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // Skip validation for GET requests without body
  if (req.method === 'GET' && !req.body) {
    return next();
  }

  // Validate and sanitize common fields
  if (req.body) {
    // Sanitize string fields
    const sanitizeString = (str: string, maxLength: number = 255): string => {
      if (typeof str !== 'string') return '';
      return str.trim().slice(0, maxLength);
    };

    // Validate and sanitize email
    if (req.body.email) {
      const email = sanitizeString(req.body.email, 254);
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Invalid request data'
        });
        return;
      }
      req.body.email = email.toLowerCase();
    }

    // Validate and sanitize phone
    if (req.body.phone) {
      const phone = sanitizeString(req.body.phone, 20);
      const phoneRegex = /^\+[1-9]\d{1,14}$/;
      if (!phoneRegex.test(phone)) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Invalid request data'
        });
        return;
      }
      req.body.phone = phone;
    }

    // Sanitize name fields
    if (req.body.firstName) {
      req.body.firstName = sanitizeString(req.body.firstName, 50);
    }
    if (req.body.lastName) {
      req.body.lastName = sanitizeString(req.body.lastName, 50);
    }

    // Validate and sanitize message content
    if (req.body.content) {
      const content = sanitizeString(req.body.content, 1000);
      if (content.length === 0) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Invalid request data'
        });
        return;
      }
      req.body.content = content;
    }

    // Validate and sanitize OTP
    if (req.body.otp) {
      const otp = sanitizeString(req.body.otp, 10);
      const otpRegex = /^\d{6}$/;
      if (!otpRegex.test(otp)) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Invalid request data'
        });
        return;
      }
      req.body.otp = otp;
    }

    // Validate pagination parameters
    if (req.query['limit']) {
      const limit = parseInt(req.query['limit'] as string, 10);
      if (isNaN(limit) || limit < 1 || limit > 100) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Invalid request data'
        });
        return;
      }
      req.query['limit'] = limit.toString();
    }

    if (req.query['offset']) {
      const offset = parseInt(req.query['offset'] as string, 10);
      if (isNaN(offset) || offset < 0) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Invalid request data'
        });
        return;
      }
      req.query['offset'] = offset.toString();
    }
  }

  next();
};
