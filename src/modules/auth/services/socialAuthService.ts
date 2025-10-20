import { SocialUserInfo } from '../types';
import { OAuth2Client } from 'google-auth-library';
import config from '../../../config';

/**
 * Social Authentication Service
 * Handles Google OAuth token verification and user info extraction
 * Apple Sign-In support is optional and can be enabled later
 */
export class SocialAuthService {
  private googleClient: OAuth2Client;

  constructor() {
    // Initialize Google OAuth2 client
    this.googleClient = new OAuth2Client(config.socialAuth.google.clientId);
  }

  /**
   * Verify Google OAuth token and extract user information
   */
  async verifyGoogleToken(token: string): Promise<SocialUserInfo> {
    try {
      // Verify the Google token
      const ticket = await this.googleClient.verifyIdToken({
        idToken: token,
        audience: config.socialAuth.google.clientId,
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw new Error('Invalid Google token payload');
      }

      // Extract user information from Google payload
      return {
        id: payload.sub, // Google's unique user ID
        email: payload.email || '',
        firstName: payload.given_name || '',
        lastName: payload.family_name || '',
        ...(payload.picture && { profilePictureUrl: payload.picture }),
      };
    } catch (error) {
      console.error('Google token verification failed:', error);
      throw new Error('Invalid Google token');
    }
  }

  /**
   * Verify social token based on provider
   * Currently only supports Google Sign-In
   */
  async verifySocialToken(
    provider: 'google' | 'apple',
    token: string
  ): Promise<SocialUserInfo> {
    switch (provider) {
      case 'google':
        return this.verifyGoogleToken(token);
      case 'apple':
        throw new Error(
          'Apple Sign-In is not currently supported. Please use Google Sign-In.'
        );
      default:
        throw new Error(
          'Unsupported authentication provider. Only Google Sign-In is supported.'
        );
    }
  }
}

// Export singleton instance
export const socialAuthService = new SocialAuthService();
