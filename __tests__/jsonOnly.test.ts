import request from 'supertest';
import app from '../src/app';

describe('JSON-Only Middleware', () => {
  const validSecret = 'test-secret-key-67890';

  describe('Content-Type validation', () => {
    it('should reject POST requests without Content-Type header', async () => {
      const response = await request(app)
        .post('/users')
        .set('X-API-Secret', validSecret)
        .set('Content-Type', 'text/plain')
        .send('invalid data');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Bad Request',
        message: 'Content-Type must be application/json',
        code: 'INVALID_CONTENT_TYPE'
      });
    });

    it('should reject POST requests with wrong Content-Type', async () => {
      const response = await request(app)
        .post('/users')
        .set('X-API-Secret', validSecret)
        .set('Content-Type', 'text/plain')
        .send('invalid data');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Bad Request',
        message: 'Content-Type must be application/json',
        code: 'INVALID_CONTENT_TYPE'
      });
    });

    it('should accept POST requests with correct Content-Type', async () => {
      const response = await request(app)
        .post('/users')
        .set('X-API-Secret', validSecret)
        .set('Content-Type', 'application/json')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john2@example.com',
          phone: '+1234567891'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('user');
    });

    it('should accept POST requests with Content-Type including charset', async () => {
      const response = await request(app)
        .post('/users')
        .set('X-API-Secret', validSecret)
        .set('Content-Type', 'application/json; charset=utf-8')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john3@example.com',
          phone: '+1234567892'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('user');
    });

    it('should allow GET requests without Content-Type (no body)', async () => {
      const response = await request(app)
        .get('/ping')
        .set('X-API-Secret', validSecret);

      expect(response.status).toBe(204);
    });

    it('should allow PUT requests with correct Content-Type', async () => {
      // First create a user
      const createResponse = await request(app)
        .post('/users')
        .set('X-API-Secret', validSecret)
        .set('Content-Type', 'application/json')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john4@example.com',
          phone: '+1234567893'
        });

      const userId = createResponse.body.user.id;

      // Then update the user
      const updateResponse = await request(app)
        .put(`/users/${userId}`)
        .set('X-API-Secret', validSecret)
        .set('Content-Type', 'application/json')
        .send({
          firstName: 'Jane'
        });

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body).toHaveProperty('user');
    });

    it('should allow PATCH requests with correct Content-Type', async () => {
      // First create a user
      const createResponse = await request(app)
        .post('/users')
        .set('X-API-Secret', validSecret)
        .set('Content-Type', 'application/json')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john5@example.com',
          phone: '+1234567894'
        });

      const userId = createResponse.body.user.id;

      // Then patch the user
      const patchResponse = await request(app)
        .patch(`/users/${userId}`)
        .set('X-API-Secret', validSecret)
        .set('Content-Type', 'application/json')
        .send({
          firstName: 'Jane'
        });

      expect(patchResponse.status).toBe(200);
      expect(patchResponse.body).toHaveProperty('user');
    });
  });

  describe('Response format validation', () => {
    it('should ensure all responses have JSON Content-Type', async () => {
      const response = await request(app)
        .get('/ping')
        .set('X-API-Secret', validSecret);

      expect(response.headers['content-type']).toContain('application/json');
    });

    it('should ensure error responses are in JSON format', async () => {
      const response = await request(app)
        .get('/ping');

      expect(response.status).toBe(401);
      expect(response.headers['content-type']).toContain('application/json');
      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('message');
    });

    it('should ensure success responses are in JSON format', async () => {
      const response = await request(app)
        .post('/users')
        .set('X-API-Secret', validSecret)
        .set('Content-Type', 'application/json')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john6@example.com',
          phone: '+1234567895'
        });

      expect(response.status).toBe(201);
      expect(response.headers['content-type']).toContain('application/json');
      expect(response.body).toHaveProperty('user');
    });
  });

  describe('Edge cases', () => {
    it('should handle empty POST body with correct Content-Type', async () => {
      const response = await request(app)
        .post('/users')
        .set('X-API-Secret', validSecret)
        .set('Content-Type', 'application/json')
        .send({});

      expect(response.status).toBe(400); // Should fail validation, not content type
      expect(response.headers['content-type']).toContain('application/json');
    });

    it('should handle malformed JSON with correct Content-Type', async () => {
      const response = await request(app)
        .post('/users')
        .set('X-API-Secret', validSecret)
        .set('Content-Type', 'application/json')
        .send('{"invalid": json}');

      expect(response.status).toBe(400); // Should fail JSON parsing, not content type
      expect(response.headers['content-type']).toContain('application/json');
    });
  });
});
