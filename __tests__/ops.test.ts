import request from 'supertest';
import app from '../src/app';

describe('Ops Module', () => {
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

      // Security headers should be present
      expect(response.headers['x-powered-by']).toBeUndefined();
      expect(response.headers['vary']).toBe('Origin');
      expect(response.headers['access-control-allow-credentials']).toBe('true');
    });

    it('should handle multiple concurrent requests', async () => {
      const promises = Array(10)
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

    it('should not require API secret (ping is excluded from auth)', async () => {
      await request(app).get('/ping').expect(204);
    });

    it('should work with invalid API secret (ping is excluded from auth)', async () => {
      await request(app)
        .get('/ping')
        .set('X-API-Secret', 'invalid-secret')
        .expect(204);
    });
  });

  describe('Ops Module Structure', () => {
    it('should be accessible through root path', async () => {
      // The ops module is mounted at root path, so /ping should work
      const response = await request(app)
        .get('/ping')
        .set('X-API-Secret', validSecret)
        .expect(204);

      expect(response.status).toBe(204);
    });

    it('should not interfere with other routes', async () => {
      // Test that ops module doesn't interfere with other routes
      // Users endpoint should still work
      await request(app)
        .get('/users/me')
        .set('X-API-Secret', validSecret)
        .expect(401); // Should fail due to missing JWT, not routing issue
    });
  });

  describe('Performance and Reliability', () => {
    it('should respond quickly to ping requests', async () => {
      const startTime = Date.now();

      await request(app)
        .get('/ping')
        .set('X-API-Secret', validSecret)
        .expect(204);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // Should respond within 100ms
      expect(responseTime).toBeLessThan(100);
    });

    it('should handle rapid successive requests', async () => {
      const requests = [];

      // Make 50 rapid requests
      for (let i = 0; i < 50; i++) {
        requests.push(
          request(app).get('/ping').set('X-API-Secret', validSecret).expect(204)
        );
      }

      const responses = await Promise.all(requests);

      // All should succeed
      responses.forEach(response => {
        expect(response.status).toBe(204);
      });
    });

    it('should maintain consistent response format', async () => {
      const responses = await Promise.all([
        request(app).get('/ping').set('X-API-Secret', validSecret),
        request(app).get('/ping').set('X-API-Secret', validSecret),
        request(app).get('/ping').set('X-API-Secret', validSecret),
      ]);

      responses.forEach(response => {
        expect(response.status).toBe(204);
        expect(response.body).toEqual({});
        expect(response.text).toBe('');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed requests gracefully', async () => {
      // Test with malformed headers (ping is excluded from auth)
      await request(app).get('/ping').set('X-API-Secret', '').expect(204);
    });

    it('should handle missing content-type gracefully', async () => {
      const response = await request(app)
        .get('/ping')
        .set('X-API-Secret', validSecret)
        .unset('Content-Type')
        .expect(204);

      expect(response.status).toBe(204);
    });
  });
});
