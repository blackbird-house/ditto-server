import { Request, Response, NextFunction } from 'express';
import config from '../config';

/**
 * HTTPS enforcement middleware
 * Redirects HTTP requests to HTTPS in production
 */
export const httpsEnforcementMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Skip HTTPS enforcement in test environments, development, or when running tests
  if (
    process.env['NODE_ENV'] === 'test' ||
    process.env['NODE_ENV'] === 'development' ||
    process.env['JEST_WORKER_ID'] !== undefined
  ) {
    return next();
  }

  // Only enforce HTTPS in production
  if (config.env === 'production') {
    // Check if request is secure (HTTPS)
    const isSecure =
      req.secure ||
      req.headers['x-forwarded-proto'] === 'https' ||
      req.headers['x-forwarded-ssl'] === 'on';

    if (!isSecure) {
      // Redirect to HTTPS
      const httpsUrl = `https://${req.get('host')}${req.url}`;
      return res.redirect(301, httpsUrl);
    }
  }

  next();
};
