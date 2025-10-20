import request from 'supertest';
import app from '../src/app';

describe('Ping Endpoint', () => {
  const validSecret = 'test-secret-key-67890';

  describe('GET /ping', () => {
    it('should return 204 No Content', async () => {
      const response = await request(app)
        .get('/ping')
        .set('X-API-Secret', validSecret)
        .expect(204);

      expect(response.body).toEqual({});
      expect(response.text).toBe('');
    });

    it('should have correct headers', async () => {
      const response = await request(app)
        .get('/ping')
        .set('X-API-Secret', validSecret)
        .expect(204);

      // x-powered-by header is removed by Helmet.js for security
      expect(response.headers['x-powered-by']).toBeUndefined();
      expect(response.headers['vary']).toBe('Origin');
      expect(response.headers['access-control-allow-credentials']).toBe('true');
    });

    it('should handle multiple requests', async () => {
      // Make multiple requests to test server stability
      const promises = Array(5)
        .fill(null)
        .map(() =>
          request(app).get('/ping').set('X-API-Secret', validSecret).expect(204)
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
        .set('X-API-Secret', validSecret)
        .expect(400);
    });

    it('should not accept PUT requests', async () => {
      await request(app)
        .put('/ping')
        .set('X-API-Secret', validSecret)
        .expect(400);
    });

    it('should not accept DELETE requests', async () => {
      await request(app)
        .delete('/ping')
        .set('X-API-Secret', validSecret)
        .expect(404);
    });

    it('should not accept PATCH requests', async () => {
      await request(app)
        .patch('/ping')
        .set('X-API-Secret', validSecret)
        .expect(400);
    });
  });
});
