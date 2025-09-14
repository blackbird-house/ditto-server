import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to handle multiple slashes in URLs
 * Common issue when API clients (like RapidAPI) add trailing slashes to base URLs
 * This normalizes URLs like "//ping" to "/ping" and "///users" to "/users"
 */
export const urlNormalization = (req: Request, _res: Response, next: NextFunction): void => {
  const originalUrl = req.url;
  
  // Replace multiple consecutive slashes with single slash (except for protocol)
  req.url = req.url.replace(/\/+/g, '/');
  
  // Log URL normalization in development for debugging
  if (originalUrl !== req.url && process.env['NODE_ENV'] === 'development') {
    console.log(`URL normalized: ${originalUrl} -> ${req.url}`);
  }
  
  next();
};
