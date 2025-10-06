import { Request, Response, NextFunction } from 'express';
import config from '../config';

/**
 * Sanitize error messages to remove sensitive information
 * Removes database URLs, API keys, secrets, and other sensitive data
 */
const sanitizeErrorMessage = (message: string): string => {
  if (!message) return 'Unknown error';
  
  return message
    // Remove database URLs
    .replace(/postgresql:\/\/[^@]+@[^\/]+\/[^\s]+/gi, 'postgresql://***:***@***/***')
    .replace(/mysql:\/\/[^@]+@[^\/]+\/[^\s]+/gi, 'mysql://***:***@***/***')
    .replace(/mongodb:\/\/[^@]+@[^\/]+\/[^\s]+/gi, 'mongodb://***:***@***/***')
    // Remove API keys and secrets (common patterns)
    .replace(/[A-Za-z0-9]{32,}/g, (match) => {
      // Keep short strings, mask longer ones that might be secrets
      return match.length > 20 ? `${match.substring(0, 4)}...${match.substring(match.length - 4)}` : match;
    })
    // Remove common sensitive patterns
    .replace(/password[=:]\s*[^\s]+/gi, 'password=***')
    .replace(/token[=:]\s*[^\s]+/gi, 'token=***')
    .replace(/key[=:]\s*[^\s]+/gi, 'key=***')
    .replace(/secret[=:]\s*[^\s]+/gi, 'secret=***')
    // Remove file paths that might contain sensitive info
    .replace(/\/[^\s]*\/[^\s]*\/[^\s]*/g, '/***/***/***')
    // Limit message length
    .substring(0, 500);
};

/**
 * Global error handler middleware
 * Catches all unhandled errors and returns consistent 500 JSON responses
 */
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log the error (only in development/test environments)
  if (config.env === 'development' || config.env === 'test') {
    console.error('🚨 Unhandled Error:', {
      message: error.message,
      stack: error.stack,
      url: req.url,
      method: req.method,
      timestamp: new Date().toISOString()
    });
  } else {
    // Safe production logging - no sensitive data
    console.error('🚨 Production Error:', {
      message: sanitizeErrorMessage(error.message),
      name: error.name,
      url: req.url,
      method: req.method,
      timestamp: new Date().toISOString(),
      userAgent: req.get('User-Agent')?.substring(0, 100) || 'unknown'
    });
  }

  // Don't send response if headers have already been sent
  if (res.headersSent) {
    return next(error);
  }

  // Set Content-Type to JSON
  res.setHeader('Content-Type', 'application/json');

  // Send consistent 500 error response
  res.status(500).json({
    error: 'Internal Server Error',
    message: 'An unexpected error occurred. Please try again later.',
    ...((config.env === 'development' || config.env === 'test') && {
      details: error.message,
      stack: error.stack
    })
  });
};

/**
 * Async error wrapper to catch async errors in route handlers
 * Usage: wrapAsync(async (req, res, next) => { ... })
 */
export const wrapAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
