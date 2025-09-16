import { EnvironmentConfig, Environment } from '../types';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from environment-specific .env file
const env = (process.env['NODE_ENV'] || 'development') as Environment;
const envFile = `.env.${env}`;

// Try to load environment-specific file first, then fallback to .env
dotenv.config({ path: path.resolve(process.cwd(), envFile) });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Helper function to generate CORS origins based on port
const getCorsOrigins = (port: number): string[] => {
  const baseOrigins = process.env['CORS_ORIGIN']?.split(',') || [];
  const dynamicOrigins = [
    `http://localhost:${port}`,
    `http://127.0.0.1:${port}`,
    `http://localhost:${port + 1}`, // For potential frontend on next port
  ];
  return [...new Set([...baseOrigins, ...dynamicOrigins])];
};

const config: Record<Environment, EnvironmentConfig> = {
  development: {
    port: parseInt(process.env['PORT'] || '3000', 10),
    env: 'development',
    logLevel: 'debug',
    cors: {
      origin: getCorsOrigins(parseInt(process.env['PORT'] || '3000', 10)),
      credentials: true
    },
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 1000 // limit each IP to 1000 requests per windowMs
    },
    database: {
      url: process.env['DATABASE_URL'] || './data/ditto-dev.db',
      type: 'sqlite'
    },
    features: {
      enableDebugRoutes: true,
      enableMockData: true,
      enableExperimentalFeatures: true
    },
    secret: {
      key: process.env['API_SECRET'] || (() => {
        throw new Error('API_SECRET environment variable is required');
      })(),
      headerName: 'X-API-Secret'
    },
    jwt: {
      secret: process.env['JWT_SECRET'] || (() => {
        throw new Error('JWT_SECRET environment variable is required');
      })(),
      expiresIn: '24h'
    }
  },

  test: {
    port: parseInt(process.env['PORT'] || '3001', 10),
    env: 'test',
    logLevel: 'error',
    cors: {
      origin: getCorsOrigins(parseInt(process.env['PORT'] || '3001', 10)),
      credentials: true
    },
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 1000 // limit each IP to 1000 requests per windowMs
    },
    database: {
      url: process.env['DATABASE_URL'] || ':memory:',
      type: 'sqlite'
    },
    features: {
      enableDebugRoutes: true,
      enableMockData: true,
      enableExperimentalFeatures: true
    },
    secret: {
      key: process.env['API_SECRET'] || (() => {
        throw new Error('API_SECRET environment variable is required');
      })(),
      headerName: 'X-API-Secret'
    },
    jwt: {
      secret: process.env['JWT_SECRET'] || (() => {
        throw new Error('JWT_SECRET environment variable is required');
      })(),
      expiresIn: '1h'
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
      url: process.env['DATABASE_URL'] || 'mongodb://localhost:27017/ditto-staging',
      type: 'mongodb'
    },
    features: {
      enableDebugRoutes: false,
      enableMockData: false,
      enableExperimentalFeatures: false
    },
    secret: {
      key: process.env['API_SECRET'] || (() => {
        throw new Error('API_SECRET environment variable is required');
      })(),
      headerName: 'X-API-Secret'
    },
    jwt: {
      secret: process.env['JWT_SECRET'] || (() => {
        throw new Error('JWT_SECRET environment variable is required');
      })(),
      expiresIn: '12h'
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
      url: process.env['DATABASE_URL'] || 'mongodb://localhost:27017/ditto-prod',
      type: 'mongodb'
    },
    features: {
      enableDebugRoutes: false,
      enableMockData: false,
      enableExperimentalFeatures: false
    },
    secret: {
      key: process.env['API_SECRET'] || (() => {
        throw new Error('API_SECRET environment variable is required');
      })(),
      headerName: 'X-API-Secret'
    },
    jwt: {
      secret: process.env['JWT_SECRET'] || (() => {
        throw new Error('JWT_SECRET environment variable is required');
      })(),
      expiresIn: '24h'
    }
  }
};

export default config[env];
