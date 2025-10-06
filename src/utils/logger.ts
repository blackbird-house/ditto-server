import { Request } from 'express';
import config from '../config';

/**
 * Safe error logging utility for production
 * Sanitizes error messages and provides consistent logging format
 */
export const logError = (module: string, operation: string, error: unknown, req: Request) => {
  if (config.env === 'production') {
    console.error(`🚨 ${module} ${operation} Error:`, {
      module,
      operation,
      error: error instanceof Error ? error.message : 'Unknown error',
      errorName: error instanceof Error ? error.name : 'Unknown',
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString()
    });
  } else {
    console.error(`🚨 ${module} ${operation} Error:`, error);
  }
};

/**
 * Safe request logging utility for production
 * Logs request details without sensitive data
 */
export const logRequest = (module: string, operation: string, req: Request, additionalData?: Record<string, any>) => {
  if (config.env === 'production') {
    console.log(`🔍 ${module} ${operation} Request:`, {
      module,
      operation,
      method: req.method,
      path: req.path,
      timestamp: new Date().toISOString(),
      userAgent: req.get('User-Agent')?.substring(0, 100) || 'unknown',
      contentType: req.get('Content-Type') || 'none',
      contentLength: req.get('Content-Length') || '0',
      hasAuth: !!req.headers.authorization,
      hasApiSecret: !!req.headers['x-api-secret'],
      ...additionalData
    });
  } else {
    console.log(`🔍 ${module} ${operation} Request:`, {
      method: req.method,
      path: req.path,
      ...additionalData
    });
  }
};
