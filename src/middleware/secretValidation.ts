import { Request, Response, NextFunction } from 'express';
import config from '../config';

/**
 * Middleware to validate API secret from request headers
 * All requests must include the correct secret header to be accepted
 * Excludes docs and debug endpoints from secret validation
 */
export const secretValidationMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Skip secret validation for docs, debug, and ping endpoints
  if (
    req.path.startsWith('/docs') ||
    req.path.startsWith('/debug') ||
    req.path === '/ping'
  ) {
    return next();
  }

  const secretHeader = req.headers[
    config.secret.headerName.toLowerCase()
  ] as string;

  if (!secretHeader) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required',
    });
    return;
  }

  if (secretHeader !== config.secret.key) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required',
    });
    return;
  }

  // Secret is valid, proceed to next middleware
  next();
};
