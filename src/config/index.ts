import { EnvironmentConfig, Environment } from './types';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from environment-specific .env file
const env = (process.env['NODE_ENV'] || 'development') as Environment;
const envFile = `.env.${env}`;

console.log(`🔧 Loading config for environment: ${env}`);
console.log(`📁 Environment file: ${envFile}`);

// Try to load environment-specific file first, then fallback to .env
dotenv.config({ path: path.resolve(process.cwd(), envFile) });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

console.log(`✅ Environment variables loaded. NODE_ENV: ${process.env['NODE_ENV']}`);
console.log(`🎯 Selected environment: ${env}`);

// Helper function to generate CORS origins based on port
const getCorsOrigins = (port: number): string[] => {
  const baseOrigins = process.env['CORS_ORIGIN']?.split(',') || [];
  const dynamicOrigins = [
    `http://localhost:${port}`,
    `http://127.0.0.1:${port}`,
    `http://localhost:${port + 1}`, // For potential frontend on next port
    `https://ditto-six.vercel.ap`
  ];
  return [...new Set([...baseOrigins, ...dynamicOrigins])];
};

// Function to get configuration for a specific environment
const getConfig = (environment: Environment): EnvironmentConfig => {
  console.log(`🔧 Getting config for environment: ${environment}`);
  
  // Create configuration functions to avoid immediate evaluation
  const getDevelopmentConfig = (): EnvironmentConfig => ({
    port: parseInt(process.env['PORT'] || '3000', 10),
    env: 'development',
    logLevel: 'debug',
    cors: {
      origin: getCorsOrigins(parseInt(process.env['PORT'] || '3000', 10)),
      credentials: true
    },
      database: {
        url: process.env['DATABASE_URL'] || './data/ditto-dev.db',
        type: 'sqlite'
      },
    features: {
      enableDebugRoutes: true,
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
      expiresIn: '3m',
      refreshExpiresIn: '30d'
    }
  });

  const getTestConfig = (): EnvironmentConfig => ({
    port: parseInt(process.env['PORT'] || '3001', 10),
    env: 'test',
    logLevel: 'error',
    cors: {
      origin: getCorsOrigins(parseInt(process.env['PORT'] || '3001', 10)),
      credentials: true
    },
    database: {
      url: process.env['DATABASE_URL'] || ':memory:',
      type: 'sqlite'
    },
    features: {
      enableDebugRoutes: true,
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
      expiresIn: '3m',
      refreshExpiresIn: '30d'
    }
  });

  const getStagingConfig = (): EnvironmentConfig => ({
    port: parseInt(process.env['PORT'] || '3000', 10),
    env: 'staging',
    logLevel: 'info',
    cors: {
      origin: process.env['CORS_ORIGIN'] ? process.env['CORS_ORIGIN'].split(',') : ['https://ditto-six.vercel.app'],
      credentials: true
    },
    database: {
      url: process.env['DATABASE_URL'] || (() => {
        throw new Error('DATABASE_URL environment variable is required');
      })(),
      type: 'sqlite'
    },
    features: {
      enableDebugRoutes: false,
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
      expiresIn: '3m',
      refreshExpiresIn: '30d'
    }
  });

  const getProductionConfig = (): EnvironmentConfig => ({
    port: parseInt(process.env['PORT'] || '3000', 10),
    env: 'production',
    logLevel: 'warn',
    cors: {
      origin: process.env['CORS_ORIGIN'] ? process.env['CORS_ORIGIN'].split(',') : ['https://ditto-six.vercel.app'],
      credentials: true
    },
    database: {
      url: process.env['DATABASE_URL'] || (() => {
        throw new Error('DATABASE_URL environment variable is required for production');
      })(),
      type: 'supabase'
    },
    features: {
      enableDebugRoutes: false,
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
      expiresIn: '3m',
      refreshExpiresIn: '30d'
    }
  });

  // Only call the function for the requested environment
  switch (environment) {
    case 'development':
      return getDevelopmentConfig();
    case 'test':
      return getTestConfig();
    case 'staging':
      return getStagingConfig();
    case 'production':
      return getProductionConfig();
    default:
      throw new Error(`Unknown environment: ${environment}`);
  }
};

export default getConfig(env);
