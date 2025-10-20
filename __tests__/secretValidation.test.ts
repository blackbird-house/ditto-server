import request from 'supertest';
import app from '../src/app';

describe('Secret Validation Middleware', () => {
  const validSecret = 'test-secret-key-67890';
  const invalidSecret = 'invalid-secret';

  describe('GET /ping', () => {
    it('should return 204 when secret header is missing (ping is excluded from auth)', async () => {
      const response = await request(app).get('/ping');

      expect(response.status).toBe(204);
      expect(response.body).toEqual({});
    });

    it('should return 204 when secret header is invalid (ping is excluded from auth)', async () => {
      const response = await request(app)
        .get('/ping')
        .set('X-API-Secret', invalidSecret);

      expect(response.status).toBe(204);
      expect(response.body).toEqual({});
    });

    it('should return 204 when secret header is valid', async () => {
      const response = await request(app)
        .get('/ping')
        .set('X-API-Secret', validSecret);

      expect(response.status).toBe(204);
    });
  });

  describe('POST /users', () => {
    it('should return 401 when secret header is missing', async () => {
      const response = await request(app)
        .post('/users')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: `john${Date.now()}@example.com`,
          phone: `+1234567${Math.floor(Math.random() * 1000)}`,
        });

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
    });

    it('should return 401 when secret header is invalid', async () => {
      const response = await request(app)
        .post('/users')
        .set('X-API-Secret', invalidSecret)
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: `john${Date.now()}@example.com`,
          phone: `+1234567${Math.floor(Math.random() * 1000)}`,
        });

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
    });

    it('should create user when secret header is valid', async () => {
      const response = await request(app)
        .post('/users')
        .set('X-API-Secret', validSecret)
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: `john${Date.now()}@example.com`,
          phone: `+1234567${Math.floor(Math.random() * 1000)}`,
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
    });
  });

  describe('POST /auth/send-otp', () => {
    it('should return 401 when secret header is missing', async () => {
      const response = await request(app)
        .post('/auth/send-otp')
        .send({
          phone: `+1234567${Math.floor(Math.random() * 1000)}`,
        });

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
    });

    it('should return 401 when secret header is invalid', async () => {
      const response = await request(app)
        .post('/auth/send-otp')
        .set('X-API-Secret', invalidSecret)
        .send({
          phone: `+1234567${Math.floor(Math.random() * 1000)}`,
        });

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
    });

    it('should send OTP when secret header is valid', async () => {
      const response = await request(app)
        .post('/auth/send-otp')
        .set('X-API-Secret', validSecret)
        .send({
          phone: `+1234567${Math.floor(Math.random() * 1000)}`,
        });

      expect(response.status).toBe(204);
    });
  });

  describe('Case sensitivity', () => {
    it('should accept secret header with different case', async () => {
      const response = await request(app)
        .get('/ping')
        .set('x-api-secret', validSecret);

      expect(response.status).toBe(204);
    });

    it('should accept secret header with mixed case', async () => {
      const response = await request(app)
        .get('/ping')
        .set('X-Api-Secret', validSecret);

      expect(response.status).toBe(204);
    });
  });
});
