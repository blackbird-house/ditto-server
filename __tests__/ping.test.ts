import request from 'supertest';
import app from '../src/app';

describe('Ping Endpoint', () => {
  describe('GET /ping', () => {
    it('should return 204 No Content', async () => {
      const response = await request(app)
        .get('/ping')
        .expect(204);
      
      expect(response.body).toEqual({});
      expect(response.text).toBe('');
    });

    it('should have correct headers', async () => {
      const response = await request(app)
        .get('/ping')
        .expect(204);
      
      expect(response.headers['x-powered-by']).toBe('Express');
      expect(response.headers['vary']).toBe('Origin');
      expect(response.headers['access-control-allow-credentials']).toBe('true');
    });

    it('should include rate limiting headers', async () => {
      const response = await request(app)
        .get('/ping')
        .expect(204);
      
      expect(response.headers['x-ratelimit-limit']).toBeDefined();
      expect(response.headers['x-ratelimit-remaining']).toBeDefined();
      expect(response.headers['x-ratelimit-reset']).toBeDefined();
    });

    it('should handle multiple requests', async () => {
      // Make multiple requests to test rate limiting
      const promises = Array(5).fill(null).map(() => 
        request(app).get('/ping').expect(204)
      );
      
      const responses = await Promise.all(promises);
      
      responses.forEach(response => {
        expect(response.status).toBe(204);
        expect(response.body).toEqual({});
      });
    });

    it('should not accept POST requests', async () => {
      await request(app)
        .post('/ping')
        .expect(404);
    });

    it('should not accept PUT requests', async () => {
      await request(app)
        .put('/ping')
        .expect(404);
    });

    it('should not accept DELETE requests', async () => {
      await request(app)
        .delete('/ping')
        .expect(404);
    });

    it('should not accept PATCH requests', async () => {
      await request(app)
        .patch('/ping')
        .expect(404);
    });
  });
});
