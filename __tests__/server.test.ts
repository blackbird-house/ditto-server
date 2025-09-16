import request from 'supertest';
import app from '../src/app';
import config from '../src/config';

describe('Server Configuration', () => {
  describe('Environment Configuration', () => {
    it('should load correct environment configuration', () => {
      expect(config).toBeDefined();
      expect(config.env).toBe('test');
      expect(config.port).toBeDefined();
      expect(config.rateLimit).toBeDefined();
      expect(config.cors).toBeDefined();
    });

    it('should have rate limiting configured', () => {
      expect(config.rateLimit.windowMs).toBeDefined();
      expect(config.rateLimit.max).toBeDefined();
      expect(typeof config.rateLimit.windowMs).toBe('number');
      expect(typeof config.rateLimit.max).toBe('number');
    });

    it('should have CORS configured', () => {
      expect(config.cors).toBeDefined();
      expect(config.cors.origin).toBeDefined();
      expect(config.cors.credentials).toBeDefined();
    });
  });

  describe('Middleware', () => {
    it('should apply CORS middleware', async () => {
      const response = await request(app)
        .get('/ping')
        .set('X-API-Secret', 'test-secret-key-67890')
        .expect(204);
      
      expect(response.headers['access-control-allow-credentials']).toBe('true');
      expect(response.headers['vary']).toBe('Origin');
    });

    it('should apply rate limiting middleware', async () => {
      const response = await request(app)
        .get('/ping')
        .set('X-API-Secret', 'test-secret-key-67890')
        .expect(204);
      
      expect(response.headers['x-ratelimit-limit']).toBeDefined();
      expect(response.headers['x-ratelimit-remaining']).toBeDefined();
    });

    it('should apply logging middleware', async () => {
      // This test verifies the logging middleware doesn't break the request
      const response = await request(app)
        .get('/ping')
        .set('X-API-Secret', 'test-secret-key-67890')
        .expect(204);
      
      expect(response.status).toBe(204);
    });
  });

  describe('Health Check', () => {
    it('should respond to health check requests', async () => {
      const response = await request(app)
        .get('/ping')
        .set('X-API-Secret', 'test-secret-key-67890')
        .expect(204);
      
      expect(response.status).toBe(204);
      expect(response.body).toEqual({});
    });
  });

  describe('404 Error Handler', () => {
    it('should return JSON 404 for undefined routes', async () => {
      const response = await request(app)
        .get('/nonexistent-route')
        .set('X-API-Secret', 'test-secret-key-67890')
        .expect(404);
      
      expect(response.body).toEqual({
        error: 'Not Found',
        message: 'Resource not found'
      });
    });

    it('should return JSON 404 for undefined PUT routes', async () => {
      const response = await request(app)
        .put('/users/some-id')
        .set('X-API-Secret', 'test-secret-key-67890')
        .send({ firstName: 'Test' })
        .expect(404);
      
      expect(response.body).toEqual({
        error: 'Not Found',
        message: 'Resource not found'
      });
    });

    it('should return JSON 404 for undefined POST routes', async () => {
      const response = await request(app)
        .post('/invalid/endpoint')
        .set('X-API-Secret', 'test-secret-key-67890')
        .send({ test: 'data' })
        .expect(404);
      
      expect(response.body).toEqual({
        error: 'Not Found',
        message: 'Resource not found'
      });
    });
  });

});
