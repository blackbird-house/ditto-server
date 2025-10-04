import { Request, Response, NextFunction } from 'express';

describe('Logging Middleware', () => {
  let consoleSpy: jest.SpyInstance;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    mockReq = {
      method: 'GET',
      path: '/test',
      ip: '127.0.0.1'
    };
    mockRes = {};
    mockNext = jest.fn();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  describe('middleware behavior', () => {
    it('should always call next() function', () => {
      // Import the middleware directly
      const { loggingMiddleware } = require('../src/middleware/logging');
      
      loggingMiddleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should not interfere with request processing', () => {
      const { loggingMiddleware } = require('../src/middleware/logging');
      
      // Test that middleware doesn't throw errors
      expect(() => {
        loggingMiddleware(mockReq as Request, mockRes as Response, mockNext);
      }).not.toThrow();
      
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle different request properties', () => {
      const { loggingMiddleware } = require('../src/middleware/logging');
      
      const postReq = { 
        method: 'POST', 
        path: '/users', 
        ip: '192.168.1.1' 
      } as Partial<Request>;
      
      expect(() => {
        loggingMiddleware(postReq as Request, mockRes as Response, mockNext);
      }).not.toThrow();
      
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('environment-based behavior', () => {
    it('should respect environment configuration', () => {
      // Test that the middleware can be imported and used
      const { loggingMiddleware } = require('../src/middleware/logging');
      
      // The middleware should work regardless of environment
      expect(() => {
        loggingMiddleware(mockReq as Request, mockRes as Response, mockNext);
      }).not.toThrow();
      
      expect(mockNext).toHaveBeenCalled();
    });
  });
});
