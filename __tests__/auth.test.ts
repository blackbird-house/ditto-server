import request from 'supertest';
import app from '../src/app';

describe('Authentication Module', () => {
  describe('POST /auth/send-otp', () => {
    it('should send OTP with valid phone number', async () => {
      const response = await request(app)
        .post('/auth/send-otp')
        .send({ phone: '+1234567890' })
        .expect(200);

      expect(response.body).toHaveProperty('message', 'OTP sent successfully');
      expect(response.body).toHaveProperty('otpId');
    });

    it('should return 400 for missing phone number', async () => {
      const response = await request(app)
        .post('/auth/send-otp')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Bad request');
      expect(response.body).toHaveProperty('message', 'Phone number is required');
    });

    it('should return 400 for invalid phone number format', async () => {
      const response = await request(app)
        .post('/auth/send-otp')
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
        .send({ phone: '+1234567890' })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Bad request');
      expect(response.body).toHaveProperty('message', 'Phone number and OTP are required');
    });

    it('should return 400 for no OTP session', async () => {
      const response = await request(app)
        .post('/auth/verify-otp')
        .send({ phone: '+9999999999', otp: '999999' })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'No OTP session');
      expect(response.body).toHaveProperty('message', 'No OTP session found. Please request a new OTP.');
    });
  });

  describe('Authentication Flow', () => {
    it('should complete full authentication flow', async () => {
      const testPhone = '+1234567890';
      const expectedOtp = '567890'; // Last 6 digits of testPhone

      // Step 1: Send OTP
      const sendOtpResponse = await request(app)
        .post('/auth/send-otp')
        .send({ phone: testPhone })
        .expect(200);

      expect(sendOtpResponse.body).toHaveProperty('message', 'OTP sent successfully');
      expect(sendOtpResponse.body).toHaveProperty('otpId');

      // Step 2: Verify OTP with correct code (last 6 digits)
      const verifyOtpResponse = await request(app)
        .post('/auth/verify-otp')
        .send({ phone: testPhone, otp: expectedOtp })
        .expect(200);

      expect(verifyOtpResponse.body).toHaveProperty('message', 'OTP verified successfully');
      expect(verifyOtpResponse.body).toHaveProperty('token');
      expect(verifyOtpResponse.body).toHaveProperty('user');
      expect(verifyOtpResponse.body.user).toHaveProperty('phone', testPhone);
    });

    it('should fail with incorrect OTP', async () => {
      const testPhone = '+1234567890';
      const incorrectOtp = '123456'; // Wrong OTP

      // Step 1: Send OTP
      await request(app)
        .post('/auth/send-otp')
        .send({ phone: testPhone })
        .expect(200);

      // Step 2: Try to verify with incorrect OTP
      const verifyOtpResponse = await request(app)
        .post('/auth/verify-otp')
        .send({ phone: testPhone, otp: incorrectOtp })
        .expect(400);

      expect(verifyOtpResponse.body).toHaveProperty('error', 'Invalid OTP');
      expect(verifyOtpResponse.body).toHaveProperty('message', 'Invalid or expired OTP');
    });
  });
});
