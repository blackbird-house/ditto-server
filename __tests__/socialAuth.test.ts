import request from 'supertest';
import app from '../src/app';
import { socialAuthService } from '../src/modules/auth/services/socialAuthService';

// Mock the social auth service
jest.mock('../src/modules/auth/services/socialAuthService', () => ({
  socialAuthService: {
    verifySocialToken: jest.fn(),
  },
}));

const mockSocialAuthService = socialAuthService as jest.Mocked<
  typeof socialAuthService
>;

describe('Social Authentication Module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /auth/social', () => {
    it('should authenticate with Google successfully', async () => {
      // Mock successful Google token verification
      mockSocialAuthService.verifySocialToken.mockResolvedValue({
        id: 'google_123456789',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        profilePictureUrl: 'https://example.com/profile.jpg',
      });

      const response = await request(app)
        .post('/auth/social')
        .set('X-API-Secret', 'test-secret-key-67890')
        .send({
          provider: 'google',
          token: 'valid-google-token',
        })
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toMatchObject({
        id: expect.any(String),
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        authProvider: 'google',
        profilePictureUrl: 'https://example.com/profile.jpg',
      });

      expect(mockSocialAuthService.verifySocialToken).toHaveBeenCalledWith(
        'google',
        'valid-google-token'
      );
    });

    it('should reject Apple Sign-In requests', async () => {
      const response = await request(app)
        .post('/auth/social')
        .set('X-API-Secret', 'test-secret-key-67890')
        .send({
          provider: 'apple',
          token: 'valid-apple-token',
        })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Bad request');
      expect(response.body).toHaveProperty(
        'message',
        'Only Google Sign-In is currently supported'
      );

      // Verify that the social auth service was not called
      expect(mockSocialAuthService.verifySocialToken).not.toHaveBeenCalled();
    });

    it('should return 400 for missing provider', async () => {
      const response = await request(app)
        .post('/auth/social')
        .set('X-API-Secret', 'test-secret-key-67890')
        .send({
          token: 'valid-token',
        })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Bad request');
      expect(response.body).toHaveProperty(
        'message',
        'Provider and token are required'
      );
    });

    it('should return 400 for missing token', async () => {
      const response = await request(app)
        .post('/auth/social')
        .set('X-API-Secret', 'test-secret-key-67890')
        .send({
          provider: 'google',
        })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Bad request');
      expect(response.body).toHaveProperty(
        'message',
        'Provider and token are required'
      );
    });

    it('should return 400 for invalid provider', async () => {
      const response = await request(app)
        .post('/auth/social')
        .set('X-API-Secret', 'test-secret-key-67890')
        .send({
          provider: 'facebook',
          token: 'valid-token',
        })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Bad request');
      expect(response.body).toHaveProperty(
        'message',
        'Only Google Sign-In is currently supported'
      );
    });

    it('should return 401 for invalid Google token', async () => {
      // Mock invalid Google token
      mockSocialAuthService.verifySocialToken.mockRejectedValue(
        new Error('Invalid Google token')
      );

      const response = await request(app)
        .post('/auth/social')
        .set('X-API-Secret', 'test-secret-key-67890')
        .send({
          provider: 'google',
          token: 'invalid-google-token',
        })
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Unauthorized');
      expect(response.body).toHaveProperty(
        'message',
        'Invalid Google authentication token'
      );
    });

    it('should return 400 for Apple provider (not supported)', async () => {
      const response = await request(app)
        .post('/auth/social')
        .set('X-API-Secret', 'test-secret-key-67890')
        .send({
          provider: 'apple',
          token: 'invalid-apple-token',
        })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Bad request');
      expect(response.body).toHaveProperty(
        'message',
        'Only Google Sign-In is currently supported'
      );
    });

    it('should return 400 for unsupported provider error from service', async () => {
      // Mock unsupported provider error from the service
      mockSocialAuthService.verifySocialToken.mockRejectedValue(
        new Error(
          'Unsupported authentication provider. Only Google Sign-In is supported.'
        )
      );

      const response = await request(app)
        .post('/auth/social')
        .set('X-API-Secret', 'test-secret-key-67890')
        .send({
          provider: 'google',
          token: 'valid-token',
        })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Bad request');
      expect(response.body).toHaveProperty(
        'message',
        'Unsupported authentication provider. Only Google Sign-In is supported.'
      );
    });

    it('should return 500 for social authentication failure', async () => {
      // Mock general authentication failure
      mockSocialAuthService.verifySocialToken.mockRejectedValue(
        new Error('Social authentication failed')
      );

      const response = await request(app)
        .post('/auth/social')
        .set('X-API-Secret', 'test-secret-key-67890')
        .send({
          provider: 'google',
          token: 'valid-token',
        })
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Internal server error');
      expect(response.body).toHaveProperty(
        'message',
        'Social authentication failed'
      );
    });

    it('should return 500 for unexpected errors', async () => {
      // Mock unexpected error
      mockSocialAuthService.verifySocialToken.mockRejectedValue(
        new Error('Unexpected error')
      );

      const response = await request(app)
        .post('/auth/social')
        .set('X-API-Secret', 'test-secret-key-67890')
        .send({
          provider: 'google',
          token: 'valid-token',
        })
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Internal server error');
      expect(response.body).toHaveProperty(
        'message',
        'Failed to authenticate with social provider'
      );
    });

    it('should require API secret', async () => {
      const response = await request(app)
        .post('/auth/social')
        .send({
          provider: 'google',
          token: 'valid-token',
        })
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Unauthorized');
      expect(response.body).toHaveProperty(
        'message',
        'Authentication required'
      );
    });
  });
});
