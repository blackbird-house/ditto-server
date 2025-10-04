import { Request, Response, NextFunction } from 'express';
import config from '../config';

/**
 * Logging middleware that logs HTTP requests
 * Only active in non-test environments
 */
export const loggingMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
  // Skip logging in test environment
  if (config.env === 'test') {
    return next();
  }

  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - ${req.ip}`);
  next();
};
