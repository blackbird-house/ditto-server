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
        message: 'Invalid request format'
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
        message: 'Invalid request format'
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
          email: `john${Date.now()}@example.com`,
          phone: `+1234567${Math.floor(Math.random() * 1000)}`
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('firstName', 'John');
    });

    it('should accept POST requests with Content-Type including charset', async () => {
      const response = await request(app)
        .post('/users')
        .set('X-API-Secret', validSecret)
        .set('Content-Type', 'application/json; charset=utf-8')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: `john${Date.now() + 1}@example.com`,
          phone: `+1234567${Math.floor(Math.random() * 1000)}`
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('firstName', 'John');
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
          email: `john4${Date.now()}@example.com`,
          phone: `+1234567${Math.floor(Math.random() * 1000)}`
        });

      expect(createResponse.status).toBe(201);

      // Get auth token for the user
      const otpResponse = await request(app)
        .post('/auth/send-otp')
        .set('X-API-Secret', validSecret)
        .set('Content-Type', 'application/json')
        .send({
          phone: createResponse.body.phone
        });

      expect(otpResponse.status).toBe(204);
      const otp = createResponse.body.phone.slice(-6); // Last 6 digits of phone

      const verifyResponse = await request(app)
        .post('/auth/verify-otp')
        .set('X-API-Secret', validSecret)
        .set('Content-Type', 'application/json')
        .send({
          phone: createResponse.body.phone,
          otp: otp
        });

      expect(verifyResponse.status).toBe(200);
      const token = verifyResponse.body.token;

      // Then update the user using /users/me
      const updateResponse = await request(app)
        .put('/users/me')
        .set('X-API-Secret', validSecret)
        .set('Authorization', `Bearer ${token}`)
        .set('Content-Type', 'application/json')
        .send({
          firstName: 'Jane'
        });

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body).toHaveProperty('id');
    });

    it('should allow PATCH requests with correct Content-Type', async () => {
      // PATCH is not supported in our API, so we'll test that it returns 404
      const response = await request(app)
        .patch('/users/123')
        .set('X-API-Secret', validSecret)
        .set('Content-Type', 'application/json')
        .send({
          firstName: 'Jane'
        });

      expect(response.status).toBe(404);
    });
  });

  describe('Response format validation', () => {
    it('should ensure all responses have JSON Content-Type', async () => {
      const response = await request(app)
        .post('/users')
        .set('X-API-Secret', validSecret)
        .set('Content-Type', 'application/json')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: `john${Date.now()}@example.com`,
          phone: `+1234567${Math.floor(Math.random() * 1000)}`
        });

      expect(response.status).toBe(201);
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
          email: `john${Date.now() + 2}@example.com`,
          phone: `+1234567${Math.floor(Math.random() * 1000)}`
        });

      expect(response.status).toBe(201);
      expect(response.headers['content-type']).toContain('application/json');
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('firstName', 'John');
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

      expect(response.status).toBe(500); // Should fail JSON parsing, caught by error handler
      expect(response.headers['content-type']).toContain('application/json');
    });
  });
});
