import { Request, Response, NextFunction } from 'express';
import config from '../config';

/**
 * Middleware to validate API secret from request headers
 * All requests must include the correct secret header to be accepted
 */
export const secretValidationMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const secretHeader = req.headers[config.secret.headerName.toLowerCase()] as string;
  
  if (!secretHeader) {
    res.status(401).json({
      error: 'Unauthorized',
      message: `Missing required header: ${config.secret.headerName}`,
      code: 'MISSING_SECRET_HEADER'
    });
    return;
  }

  if (secretHeader !== config.secret.key) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid API secret',
      code: 'INVALID_SECRET'
    });
    return;
  }

  // Secret is valid, proceed to next middleware
  next();
};
