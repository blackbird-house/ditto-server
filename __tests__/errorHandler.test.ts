import request from 'supertest';
import app from '../src/app';

describe('Error Handler Middleware', () => {
  const validSecret = 'test-secret-key-67890';

  describe('Error Handler Integration', () => {
    it('should not interfere with normal error responses', async () => {
      // Test that 404 errors still work
      const response = await request(app)
        .get('/nonexistent-route')
        .set('X-API-Secret', validSecret);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Not Found');
    });

    it('should not interfere with validation errors', async () => {
      // Test that 400 errors still work
      const response = await request(app)
        .post('/users')
        .set('X-API-Secret', validSecret)
        .set('Content-Type', 'text/plain')
        .send('invalid data');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Bad Request');
    });

    it('should return JSON error responses', async () => {
      // Test that 404 errors return JSON format
      const response = await request(app)
        .get('/nonexistent-route')
        .set('X-API-Secret', validSecret);

      expect(response.status).toBe(404);
      expect(response.headers['content-type']).toContain('application/json');
      expect(typeof response.body).toBe('object');
      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('message');
    });
  });
});
