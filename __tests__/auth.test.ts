import request from 'supertest';
import app from '../src/app';

describe('Authentication Module', () => {
  describe('POST /auth/send-otp', () => {
    it('should send OTP with valid phone number', async () => {
      const response = await request(app)
        .post('/auth/send-otp')
        .set('X-API-Secret', 'test-secret-key-67890')
        .send({ phone: '+1234567890' })
        .expect(204);

      expect(response.body).toEqual({});
    });

    it('should return 400 for missing phone number', async () => {
      const response = await request(app)
        .post('/auth/send-otp')
        .set('X-API-Secret', 'test-secret-key-67890')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Bad request');
      expect(response.body).toHaveProperty('message', 'Phone number is required');
    });

    it('should return 400 for invalid phone number format', async () => {
      const response = await request(app)
        .post('/auth/send-otp')
        .set('X-API-Secret', 'test-secret-key-67890')
        .send({ phone: 'invalid-phone' })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Invalid phone number');
      expect(response.body).toHaveProperty('message', 'Please provide a valid phone number in international format (e.g., +1234567890)');
    });
  });

  describe('POST /auth/verify-otp', () => {
    it('should return 400 for missing phone or OTP', async () => {
      const response = await request(app)
        .post('/auth/verify-otp')
        .set('X-API-Secret', 'test-secret-key-67890')
        .send({ phone: '+1234567890' })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Bad request');
      expect(response.body).toHaveProperty('message', 'Phone number and OTP are required');
    });

    it('should return 400 for no OTP session', async () => {
      const response = await request(app)
        .post('/auth/verify-otp')
        .set('X-API-Secret', 'test-secret-key-67890')
        .send({ phone: '+9999999999', otp: '999999' })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'No OTP session');
      expect(response.body).toHaveProperty('message', 'No OTP session found. Please request a new OTP.');
    });
  });

  describe('GET /users/me', () => {
    it('should return 401 for missing authentication token', async () => {
      const response = await request(app)
        .get('/users/me')
        .set('X-API-Secret', 'test-secret-key-67890')
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Unauthorized');
      expect(response.body).toHaveProperty('message', 'Authentication required');
    });

    it('should return 401 for invalid authentication token', async () => {
      const response = await request(app)
        .get('/users/me')
        .set('X-API-Secret', 'test-secret-key-67890')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Unauthorized');
      expect(response.body).toHaveProperty('message', 'Authentication required');
    });

    it('should return user profile with valid token', async () => {
      const testPhone = `+1234567${Math.floor(Math.random() * 1000)}`;
      const expectedOtp = testPhone.slice(-6); // Last 6 digits of testPhone
      const testEmail = `john.doe${Date.now()}@example.com`;

      // Step 1: Create a user first
      await request(app)
        .post('/users')
        .set('X-API-Secret', 'test-secret-key-67890')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: testEmail,
          phone: testPhone
        })
        .expect(201);

      // Step 2: Send OTP
      await request(app)
        .post('/auth/send-otp')
        .set('X-API-Secret', 'test-secret-key-67890')
        .send({ phone: testPhone })
        .expect(204);

      // Step 3: Verify OTP to get token
      const verifyOtpResponse = await request(app)
        .post('/auth/verify-otp')
        .set('X-API-Secret', 'test-secret-key-67890')
        .send({ phone: testPhone, otp: expectedOtp })
        .expect(200);

      const token = verifyOtpResponse.body.token;
      const refreshToken = verifyOtpResponse.body.refreshToken;

      // Verify both tokens are present
      expect(token).toBeDefined();
      expect(refreshToken).toBeDefined();

      // Step 4: Get user profile using token
      const getMeResponse = await request(app)
        .get('/users/me')
        .set('X-API-Secret', 'test-secret-key-67890')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(getMeResponse.body).toHaveProperty('id');
      expect(getMeResponse.body).toHaveProperty('phone', testPhone);
      expect(getMeResponse.body).toHaveProperty('firstName', 'John');
      expect(getMeResponse.body).toHaveProperty('lastName', 'Doe');
      expect(getMeResponse.body).toHaveProperty('email', testEmail);
      expect(getMeResponse.body).toHaveProperty('createdAt');
      expect(getMeResponse.body).toHaveProperty('updatedAt');
    });
  });

  describe('Authentication Flow', () => {
    it('should complete full authentication flow', async () => {
      const testPhone = `+1234567${Math.floor(Math.random() * 1000)}`;
      const expectedOtp = testPhone.slice(-6); // Last 6 digits of testPhone

      // Step 1: Create a user first
      await request(app)
        .post('/users')
        .set('X-API-Secret', 'test-secret-key-67890')
        .send({
          firstName: 'Jane',
          lastName: 'Smith',
          email: `jane.smith${Date.now()}@example.com`,
          phone: testPhone
        })
        .expect(201);

      // Step 2: Send OTP
      const sendOtpResponse = await request(app)
        .post('/auth/send-otp')
        .set('X-API-Secret', 'test-secret-key-67890')
        .send({ phone: testPhone })
        .expect(204);

      expect(sendOtpResponse.body).toEqual({});

      // Step 3: Verify OTP with correct code (last 6 digits)
      const verifyOtpResponse = await request(app)
        .post('/auth/verify-otp')
        .set('X-API-Secret', 'test-secret-key-67890')
        .send({ phone: testPhone, otp: expectedOtp })
        .expect(200);

      expect(verifyOtpResponse.body).toHaveProperty('token');
      expect(verifyOtpResponse.body.token).toBeTruthy();
    });

    it('should fail with incorrect OTP', async () => {
      const testPhone = `+1234567${Math.floor(Math.random() * 1000)}`;
      const incorrectOtp = '123456'; // Wrong OTP

      // Step 1: Create a user first
      await request(app)
        .post('/users')
        .set('X-API-Secret', 'test-secret-key-67890')
        .send({
          firstName: 'Bob',
          lastName: 'Johnson',
          email: `bob.johnson${Date.now()}@example.com`,
          phone: testPhone
        })
        .expect(201);

      // Step 2: Send OTP
      await request(app)
        .post('/auth/send-otp')
        .set('X-API-Secret', 'test-secret-key-67890')
        .send({ phone: testPhone })
        .expect(204);

      // Step 3: Try to verify with incorrect OTP
      const verifyOtpResponse = await request(app)
        .post('/auth/verify-otp')
        .set('X-API-Secret', 'test-secret-key-67890')
        .send({ phone: testPhone, otp: incorrectOtp })
        .expect(400);

      expect(verifyOtpResponse.body).toHaveProperty('error', 'Invalid OTP');
      expect(verifyOtpResponse.body).toHaveProperty('message', 'Invalid or expired OTP');
    });

    it('should return 404 when user is not found', async () => {
      const testPhone = '+9999999999'; // Phone number that doesn't exist
      const expectedOtp = '999999'; // Last 6 digits of testPhone

      // Step 1: Send OTP (this will work even if user doesn't exist)
      await request(app)
        .post('/auth/send-otp')
        .set('X-API-Secret', 'test-secret-key-67890')
        .send({ phone: testPhone })
        .expect(204);

      // Step 2: Try to verify OTP for non-existent user
      const verifyOtpResponse = await request(app)
        .post('/auth/verify-otp')
        .set('X-API-Secret', 'test-secret-key-67890')
        .send({ phone: testPhone, otp: expectedOtp })
        .expect(404);

      expect(verifyOtpResponse.body).toHaveProperty('error', 'Not found');
      expect(verifyOtpResponse.body).toHaveProperty('message', 'User not found');
    });
  });

  describe('Refresh Token', () => {
    it('should refresh token successfully with valid refresh token', async () => {
      const testPhone = `+1234567${Math.floor(Math.random() * 1000)}`;
      const expectedOtp = testPhone.slice(-6);

      // Step 1: Create a user first
      await request(app)
        .post('/users')
        .set('X-API-Secret', 'test-secret-key-67890')
        .send({
          firstName: 'Refresh',
          lastName: 'User',
          email: `refresh.user${Date.now()}@example.com`,
          phone: testPhone
        })
        .expect(201);

      // Step 2: Send OTP
      await request(app)
        .post('/auth/send-otp')
        .set('X-API-Secret', 'test-secret-key-67890')
        .send({ phone: testPhone })
        .expect(204);

      // Step 3: Verify OTP to get tokens
      const verifyOtpResponse = await request(app)
        .post('/auth/verify-otp')
        .set('X-API-Secret', 'test-secret-key-67890')
        .send({ phone: testPhone, otp: expectedOtp })
        .expect(200);

      const originalToken = verifyOtpResponse.body.token;
      const refreshToken = verifyOtpResponse.body.refreshToken;

      // Step 4: Refresh the token
      const refreshResponse = await request(app)
        .post('/auth/refresh-token')
        .set('X-API-Secret', 'test-secret-key-67890')
        .send({ refreshToken })
        .expect(200);

      const newToken = refreshResponse.body.token;
      const newRefreshToken = refreshResponse.body.refreshToken;

      // Verify new tokens are different from original
      expect(newToken).toBeDefined();
      expect(newRefreshToken).toBeDefined();
      expect(newToken).not.toBe(originalToken);
      expect(newRefreshToken).not.toBe(refreshToken);

      // Step 5: Use new token to access protected endpoint
      const getMeResponse = await request(app)
        .get('/users/me')
        .set('X-API-Secret', 'test-secret-key-67890')
        .set('Authorization', `Bearer ${newToken}`)
        .expect(200);

      expect(getMeResponse.body).toHaveProperty('id');
      expect(getMeResponse.body).toHaveProperty('phone', testPhone);
    });

    it('should return 401 for invalid refresh token', async () => {
      await request(app)
        .post('/auth/refresh-token')
        .set('X-API-Secret', 'test-secret-key-67890')
        .send({ refreshToken: 'invalid-refresh-token' })
        .expect(401);
    });

    it('should return 400 for missing refresh token', async () => {
      await request(app)
        .post('/auth/refresh-token')
        .set('X-API-Secret', 'test-secret-key-67890')
        .send({})
        .expect(400);
    });

    it('should return 401 for expired refresh token', async () => {
      // Create an expired refresh token (this would be done by manipulating the JWT)
      // For testing purposes, we'll use an obviously invalid token
      await request(app)
        .post('/auth/refresh-token')
        .set('X-API-Secret', 'test-secret-key-67890')
        .send({ refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0IiwicGhvbmUiOiIrMTIzNDU2Nzg5MCIsInR5cGUiOiJyZWZyZXNoIiwiaWF0IjoxLCJleHAiOjF9.invalid' })
        .expect(401);
    });
  });
});
