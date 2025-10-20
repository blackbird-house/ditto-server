import { Request, Response, NextFunction } from 'express';
import { authService } from '../modules/auth/services/authService';

/**
 * Authentication middleware to verify JWT tokens
 *
 * This middleware checks for a valid JWT token in the Authorization header
 * and adds the user information to the request object.
 *
 * Usage: app.use('/protected-route', authMiddleware, protectedRouteHandler);
 */
export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required',
    });
    return;
  }

  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : authHeader;

  if (!token) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required',
    });
    return;
  }

  try {
    const decoded = authService.verifyToken(token);

    if (!decoded) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
      return;
    }

    // Add user information to request object
    (req as any).user = {
      id: decoded.userId,
      phone: decoded.phone,
    };

    next();
  } catch (error) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required',
    });
  }
};
