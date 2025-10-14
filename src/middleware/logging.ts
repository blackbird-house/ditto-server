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

  // Basic logging for all requests with query parameters
  const queryString = Object.keys(req.query).length > 0 ? `?${new URLSearchParams(req.query as Record<string, string>).toString()}` : '';
  const ipInfo = (config.env === 'production' || config.env === 'staging') ? ` - ${req.ip}` : '';
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}${queryString}${ipInfo}`);
  
  // Enhanced logging for chat/message endpoints in production
  if (config.env === 'production' && (req.path.includes('/chat') || req.path.includes('/messages'))) {
    console.log(`🔍 Chat/Message Request:`, {
      method: req.method,
      path: req.path,
      query: Object.keys(req.query).length > 0 ? req.query : undefined,
      timestamp: new Date().toISOString(),
      userAgent: req.get('User-Agent')?.substring(0, 100) || 'unknown',
      contentType: req.get('Content-Type') || 'none',
      contentLength: req.get('Content-Length') || '0',
      hasAuth: !!req.headers.authorization,
      hasApiSecret: !!req.headers['x-api-secret']
    });
  }
  
  next();
};
