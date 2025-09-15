import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to enforce JSON-only requests and responses
 * Rejects requests that don't have Content-Type: application/json
 * Ensures all responses are in JSON format
 * Excludes /docs endpoint which serves HTML content
 */
export const jsonOnlyMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // Skip JSON enforcement for docs endpoint (serves HTML)
  if (req.path.startsWith('/docs')) {
    return next();
  }

  // Check if request has a body and requires JSON content type
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
    const contentType = req.headers['content-type'];
    
    if (!contentType || !contentType.includes('application/json')) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Content-Type must be application/json',
        code: 'INVALID_CONTENT_TYPE'
      });
      return;
    }
  }

  // Set default Content-Type to JSON for all responses
  res.setHeader('Content-Type', 'application/json');

  next();
};
