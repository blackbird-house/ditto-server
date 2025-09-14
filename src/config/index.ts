import { EnvironmentConfig, Environment } from '../types';

const config: Record<Environment, EnvironmentConfig> = {
  development: {
    port: parseInt(process.env['PORT'] || '3000', 10),
    env: 'development',
    logLevel: 'debug',
    cors: {
      origin: ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000'],
      credentials: true
    },
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 1000 // limit each IP to 1000 requests per windowMs
    },
    database: {
      // Add database config for dev when needed
      url: process.env['DATABASE_URL'] || 'mongodb://localhost:27017/ditto-dev'
    },
    features: {
      enableDebugRoutes: true,
      enableMockData: true,
      enableExperimentalFeatures: true
    }
  },

  test: {
    port: parseInt(process.env['PORT'] || '3001', 10),
    env: 'test',
    logLevel: 'error',
    cors: {
      origin: ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000'],
      credentials: true
    },
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 1000 // limit each IP to 1000 requests per windowMs
    },
    database: {
      url: process.env['DATABASE_URL'] || 'mongodb://localhost:27017/ditto-test'
    },
    features: {
      enableDebugRoutes: true,
      enableMockData: true,
      enableExperimentalFeatures: true
    }
  },
  
  staging: {
    port: parseInt(process.env['PORT'] || '3000', 10),
    env: 'staging',
    logLevel: 'info',
    cors: {
      origin: process.env['CORS_ORIGIN'] ? process.env['CORS_ORIGIN'].split(',') : ['https://staging.ditto-server.com'],
      credentials: true
    },
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 500 // limit each IP to 500 requests per windowMs
    },
    database: {
      url: process.env['DATABASE_URL'] || 'mongodb://localhost:27017/ditto-staging'
    },
    features: {
      enableDebugRoutes: false,
      enableMockData: false,
      enableExperimentalFeatures: false
    }
  },
  
  production: {
    port: parseInt(process.env['PORT'] || '3000', 10),
    env: 'production',
    logLevel: 'warn',
    cors: {
      origin: process.env['CORS_ORIGIN'] ? process.env['CORS_ORIGIN'].split(',') : ['https://api.ditto-server.com'],
      credentials: true
    },
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100 // limit each IP to 100 requests per windowMs
    },
    database: {
      url: process.env['DATABASE_URL'] || 'mongodb://localhost:27017/ditto-prod'
    },
    features: {
      enableDebugRoutes: false,
      enableMockData: false,
      enableExperimentalFeatures: false
    }
  }
};

const env = (process.env['NODE_ENV'] || 'development') as Environment;

export default config[env];
