import request from 'supertest';
import app from '../src/app';

describe('Rate Limiting', () => {
  describe('Rate Limit Headers', () => {
    it('should include rate limit headers in response', async () => {
      const response = await request(app)
        .get('/ping')
        .expect(204);
      
      expect(response.headers['x-ratelimit-limit']).toBeDefined();
      expect(response.headers['x-ratelimit-remaining']).toBeDefined();
      expect(response.headers['x-ratelimit-reset']).toBeDefined();
      
      // Parse the limit to ensure it's a number
      const limit = parseInt(response.headers['x-ratelimit-limit'] as string, 10);
      const remaining = parseInt(response.headers['x-ratelimit-remaining'] as string, 10);
      
      expect(limit).toBeGreaterThan(0);
      expect(remaining).toBeGreaterThanOrEqual(0);
      expect(remaining).toBeLessThanOrEqual(limit);
    });

    it('should decrement remaining count on each request', async () => {
      const response1 = await request(app)
        .get('/ping')
        .expect(204);
      
      const response2 = await request(app)
        .get('/ping')
        .expect(204);
      
      const remaining1 = parseInt(response1.headers['x-ratelimit-remaining'] as string, 10);
      const remaining2 = parseInt(response2.headers['x-ratelimit-remaining'] as string, 10);
      
      expect(remaining2).toBeLessThan(remaining1);
    });
  });

  describe('Rate Limit Behavior', () => {
    it('should allow requests within rate limit', async () => {
      // Make a few requests to test rate limiting
      const promises = Array(5).fill(null).map(() => 
        request(app).get('/ping')
      );
      
      const responses = await Promise.all(promises);
      
      responses.forEach(response => {
        expect(response.status).toBe(204);
      });
    });

    it('should have consistent rate limit across multiple requests', async () => {
      const response1 = await request(app)
        .get('/ping')
        .expect(204);
      
      const response2 = await request(app)
        .get('/ping')
        .expect(204);
      
      expect(response1.headers['x-ratelimit-limit']).toBe(response2.headers['x-ratelimit-limit']);
    });
  });
});
