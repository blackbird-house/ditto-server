import { Request, Response, NextFunction } from 'express';
import config from '../config';

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
