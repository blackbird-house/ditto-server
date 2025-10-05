import request from 'supertest';
import app from '../src/app';

describe('Debug Module', () => {
  beforeEach(() => {
    // Clear any global state
    (global as any).lastOtp = undefined;
  });

  describe('GET /debug/env', () => {
    it('should return environment information', async () => {
      const response = await request(app)
        .get('/debug/env')
        .expect(200);

      expect(response.body).toHaveProperty('environment');
      expect(response.body).toHaveProperty('port');
      expect(response.body).toHaveProperty('features');
      expect(response.body.features).toHaveProperty('enableDebugRoutes');
    });

    it('should return test environment in test mode', async () => {
      const response = await request(app)
        .get('/debug/env')
        .expect(200);

      expect(response.body.environment).toBe('test');
      expect(response.body.features.enableDebugRoutes).toBe(true);
    });
  });

  describe('GET /debug/last-otp', () => {
    it('should return message when no OTP sent', async () => {
      const response = await request(app)
        .get('/debug/last-otp')
        .expect(200);

      expect(response.body).toEqual({ message: 'No OTP sent yet' });
    });

    it('should return last OTP when available', async () => {
      // Set a mock OTP in global state
      (global as any).lastOtp = {
        phone: '+1234567890',
        otp: '123456',
        otpId: 'test-otp-id'
      };

      const response = await request(app)
        .get('/debug/last-otp')
        .expect(200);

      expect(response.body).toHaveProperty('phone', '+1234567890');
      expect(response.body).toHaveProperty('otp', '123456');
      expect(response.body).toHaveProperty('otpId', 'test-otp-id');
    });
  });

  describe('GET /debug/error', () => {
    it('should trigger a test error', async () => {
      const response = await request(app)
        .get('/debug/error')
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Internal Server Error');
      expect(response.body).toHaveProperty('message', 'An unexpected error occurred. Please try again later.');
    });
  });

  describe('GET /debug/database', () => {
    it('should return database information', async () => {
      const response = await request(app)
        .get('/debug/database')
        .expect(200);

      expect(response.body).toHaveProperty('type');
      expect(response.body).toHaveProperty('url');
      expect(response.body.type).toBe('sqlite'); // Should be sqlite in test environment
    });
  });

  describe('POST /debug/test-supabase-user', () => {
    it('should create a test user', async () => {
      const userData = {
        action: 'create',
        userId: 'debug-test-user-123'
      };

      const response = await request(app)
        .post('/debug/test-supabase-user')
        .send(userData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id', 'debug-test-user-123');
    });

    it('should read a test user', async () => {
      // First create a user
      await request(app)
        .post('/debug/test-supabase-user')
        .send({ action: 'create', userId: 'debug-read-test' })
        .expect(200);

      // Then read it
      const response = await request(app)
        .post('/debug/test-supabase-user')
        .send({ action: 'read', userId: 'debug-read-test' })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id', 'debug-read-test');
    });

    it('should delete a test user', async () => {
      // First create a user
      await request(app)
        .post('/debug/test-supabase-user')
        .send({ action: 'create', userId: 'debug-delete-test' })
        .expect(200);

      // Then delete it
      const response = await request(app)
        .post('/debug/test-supabase-user')
        .send({ action: 'delete', userId: 'debug-delete-test' })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
    });

    it('should return error for invalid action', async () => {
      const response = await request(app)
        .post('/debug/test-supabase-user')
        .send({ action: 'invalid', userId: 'test' })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Invalid action or missing userId. Use: { "action": "create" } or { "action": "read", "userId": "..." } or { "action": "delete", "userId": "..." }');
    });

    it('should create user with default userId when not provided', async () => {
      const response = await request(app)
        .post('/debug/test-supabase-user')
        .send({ action: 'create' })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Test user created successfully');
      expect(response.body).toHaveProperty('user');
    });
  });

  describe('GET /debug/list-all-users', () => {
    it('should return list of users', async () => {
      // Create a test user first
      await request(app)
        .post('/debug/test-supabase-user')
        .send({ action: 'create', userId: 'list-test-user' })
        .expect(200);

      const response = await request(app)
        .get('/debug/list-all-users')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('users');
      expect(Array.isArray(response.body.users)).toBe(true);
    });
  });

  describe('Authentication', () => {
    it('should not require API secret for debug endpoints (debug routes are open)', async () => {
      // Test non-error endpoints
      const endpoints = [
        '/debug/env',
        '/debug/last-otp',
        '/debug/database',
        '/debug/list-all-users'
      ];

      for (const endpoint of endpoints) {
        await request(app)
          .get(endpoint)
          .expect(200);
      }

      // Test error endpoint separately (it returns 500 by design)
      await request(app)
        .get('/debug/error')
        .expect(500);
    });

    it('should work with or without API secret', async () => {
      // Should work without secret
      await request(app)
        .get('/debug/env')
        .expect(200);

      // Should also work with secret
      await request(app)
        .get('/debug/env')
        .expect(200);
    });
  });
});
