import request from 'supertest';
import { Application } from 'express';
import { EnvironmentConfig } from '../src/types';

describe('Environment-Specific Tests', () => {
  let app: Application;
  let config: EnvironmentConfig;

  beforeAll(() => {
    // Clear module cache to ensure fresh imports
    jest.resetModules();
  });

  describe('Development Environment', () => {
    beforeAll(() => {
      process.env['NODE_ENV'] = 'development';
      app = require('../src/app').default;
      config = require('../src/config').default;
    });

    it('should have development configuration', () => {
      expect(config.env).toBe('development');
      expect(config.features.enableDebugRoutes).toBe(true);
      expect(config.features.enableMockData).toBe(true);
      expect(config.features.enableExperimentalFeatures).toBe(true);
      expect(config.rateLimit.max).toBe(1000);
    });

    it('should have debug endpoint available', async () => {
      const response = await request(app)
        .get('/debug/env')
        .expect(200);
      
      expect(response.body.environment).toBe('development');
      expect(response.body.features.enableDebugRoutes).toBe(true);
    });
  });

  describe('Staging Environment', () => {
    beforeAll(() => {
      jest.resetModules();
      process.env['NODE_ENV'] = 'staging';
      process.env['API_SECRET'] = 'staging-secret-key-12345';
      process.env['JWT_SECRET'] = 'staging-jwt-secret-key-12345';
      app = require('../src/app').default;
      config = require('../src/config').default;
    });

    it('should have staging configuration', () => {
      expect(config.env).toBe('staging');
      expect(config.features.enableDebugRoutes).toBe(false);
      expect(config.features.enableMockData).toBe(false);
      expect(config.features.enableExperimentalFeatures).toBe(false);
      expect(config.rateLimit.max).toBe(500);
    });

    it('should not have debug endpoint available', async () => {
      await request(app)
        .get('/debug/env')
        .expect(404);
    });
  });

  describe('Production Environment', () => {
    beforeAll(() => {
      jest.resetModules();
      process.env['NODE_ENV'] = 'production';
      process.env['API_SECRET'] = 'production-secret-key-12345';
      process.env['JWT_SECRET'] = 'production-jwt-secret-key-12345';
      app = require('../src/app').default;
      config = require('../src/config').default;
    });

    it('should have production configuration', () => {
      expect(config.env).toBe('production');
      expect(config.features.enableDebugRoutes).toBe(false);
      expect(config.features.enableMockData).toBe(false);
      expect(config.features.enableExperimentalFeatures).toBe(false);
      expect(config.rateLimit.max).toBe(100);
    });

    it('should not have debug endpoint available', async () => {
      await request(app)
        .get('/debug/env')
        .expect(404);
    });
  });

  describe('Test Environment', () => {
    beforeAll(() => {
      jest.resetModules();
      process.env['NODE_ENV'] = 'test';
      app = require('../src/app').default;
      config = require('../src/config').default;
    });

    it('should have test configuration', () => {
      expect(config.env).toBe('test');
      expect(config.rateLimit.max).toBe(1000); // Same as development
    });

    it('should have debug endpoint available in test', async () => {
      const response = await request(app)
        .get('/debug/env')
        .expect(200);
      
      expect(response.body.environment).toBe('test');
    });
  });
});
