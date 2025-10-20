import { EnvironmentConfig, Environment } from './types';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from environment-specific .env file
const env = process.env['NODE_ENV'] as Environment;
if (!env) {
  throw new Error('NODE_ENV environment variable is required but not set');
}

const envFile = `.env.${env}`;
console.log(`🔧 Loading config for environment: ${env}`);

// Only load .env files in development and test environments
// In production and staging, rely on environment variables already set by the deployment platform
if (env !== 'production') {
  console.log(`📁 Environment file: ${envFile}`);

  // Try to load environment-specific file first, then fallback to .env
  dotenv.config({ path: path.resolve(process.cwd(), envFile) });
  dotenv.config({ path: path.resolve(process.cwd(), '.env') });

  console.log(
    `✅ Environment variables loaded from .env files. NODE_ENV: ${process.env['NODE_ENV']}`
  );
}

// Helper function to generate CORS origins based on port
const getCorsOrigins = (port: number): string[] => {
  const baseOrigins = process.env['CORS_ORIGIN']?.split(',') || [];
  const dynamicOrigins = [
    `http://localhost:${port}`,
    `http://127.0.0.1:${port}`,
    `http://localhost:${port + 1}`,
    `https://ditto-six.vercel.app`,
    `https://ditto-git-staging-rici.vercel.app`,
    `https://ditto-git-develop-rici.vercel.app`,
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
      credentials: true,
    },
    database: {
      url: process.env['DATABASE_URL'] || './data/ditto-dev.db',
      type: 'sqlite',
    },
    features: {
      enableDebugRoutes: true,
    },
    secret: {
      key:
        process.env['API_SECRET'] ||
        (() => {
          throw new Error('API_SECRET environment variable is required');
        })(),
      headerName: 'X-API-Secret',
    },
    jwt: {
      secret:
        process.env['JWT_SECRET'] ||
        (() => {
          throw new Error('JWT_SECRET environment variable is required');
        })(),
      expiresIn: '3m',
      refreshExpiresIn: '30d',
    },
    socialAuth: {
      google: {
        clientId:
          process.env['GOOGLE_CLIENT_ID'] ||
          (() => {
            throw new Error(
              'GOOGLE_CLIENT_ID environment variable is required'
            );
          })(),
      },
      // Apple Sign-In configuration is optional and can be added later
    },
    openai: {
      apiKey:
        process.env['OPENAI_API_KEY'] ||
        (() => {
          throw new Error('OPENAI_API_KEY environment variable is required');
        })(),
      model: process.env['OPENAI_MODEL'] || 'gpt-3.5-turbo',
      maxTokens: parseInt(process.env['OPENAI_MAX_TOKENS'] || '1000', 10),
      temperature: parseFloat(process.env['OPENAI_TEMPERATURE'] || '0.7'),
    },
  });

  const getTestConfig = (): EnvironmentConfig => ({
    port: parseInt(process.env['PORT'] || '3001', 10),
    env: 'test',
    logLevel: 'error',
    cors: {
      origin: getCorsOrigins(parseInt(process.env['PORT'] || '3001', 10)),
      credentials: true,
    },
    database: {
      url: ':memory:',
      type: 'in-memory',
    },
    features: {
      enableDebugRoutes: true,
    },
    secret: {
      key:
        process.env['API_SECRET'] ||
        (() => {
          throw new Error('API_SECRET environment variable is required');
        })(),
      headerName: 'X-API-Secret',
    },
    jwt: {
      secret:
        process.env['JWT_SECRET'] ||
        (() => {
          throw new Error('JWT_SECRET environment variable is required');
        })(),
      expiresIn: '3m',
      refreshExpiresIn: '30d',
    },
    socialAuth: {
      google: {
        clientId: process.env['GOOGLE_CLIENT_ID'] || 'test-google-client-id',
      },
      apple: {
        clientId: process.env['APPLE_CLIENT_ID'] || 'test-apple-client-id',
        teamId: process.env['APPLE_TEAM_ID'] || 'test-team-id',
        keyId: process.env['APPLE_KEY_ID'] || 'test-key-id',
        privateKey: process.env['APPLE_PRIVATE_KEY'] || 'test-private-key',
      },
    },
    openai: {
      apiKey: process.env['OPENAI_API_KEY'] || 'test-openai-api-key',
      model: process.env['OPENAI_MODEL'] || 'gpt-3.5-turbo',
      maxTokens: parseInt(process.env['OPENAI_MAX_TOKENS'] || '1000', 10),
      temperature: parseFloat(process.env['OPENAI_TEMPERATURE'] || '0.7'),
    },
  });

  const getStagingConfig = (): EnvironmentConfig => ({
    port: parseInt(process.env['PORT'] || '443', 10),
    env: 'staging',
    logLevel: 'info',
    cors: {
      origin: process.env['CORS_ORIGIN']
        ? process.env['CORS_ORIGIN'].split(',')
        : [
            'https://ditto-six.vercel.app',
            'https://ditto-git-staging-rici.vercel.app',
          ],
      credentials: true,
    },
    database: {
      url:
        process.env['DATABASE_URL'] ||
        (() => {
          throw new Error('DATABASE_URL environment variable is required');
        })(),
      type: 'supabase',
    },
    features: {
      enableDebugRoutes: true,
    },
    secret: {
      key:
        process.env['API_SECRET'] ||
        (() => {
          throw new Error('API_SECRET environment variable is required');
        })(),
      headerName: 'X-API-Secret',
    },
    jwt: {
      secret:
        process.env['JWT_SECRET'] ||
        (() => {
          throw new Error('JWT_SECRET environment variable is required');
        })(),
      expiresIn: '3m',
      refreshExpiresIn: '30d',
    },
    socialAuth: {
      google: {
        clientId:
          process.env['GOOGLE_CLIENT_ID'] ||
          (() => {
            throw new Error(
              'GOOGLE_CLIENT_ID environment variable is required'
            );
          })(),
      },
      // Apple Sign-In configuration is optional and can be added later
    },
    openai: {
      apiKey:
        process.env['OPENAI_API_KEY'] ||
        (() => {
          throw new Error('OPENAI_API_KEY environment variable is required');
        })(),
      model: process.env['OPENAI_MODEL'] || 'gpt-3.5-turbo',
      maxTokens: parseInt(process.env['OPENAI_MAX_TOKENS'] || '1000', 10),
      temperature: parseFloat(process.env['OPENAI_TEMPERATURE'] || '0.7'),
    },
  });

  const getProductionConfig = (): EnvironmentConfig => ({
    port: parseInt(process.env['PORT'] || '443', 10),
    env: 'production',
    logLevel: 'warn',
    cors: {
      origin: process.env['CORS_ORIGIN']
        ? process.env['CORS_ORIGIN'].split(',')
        : ['https://ditto-six.vercel.app'],
      credentials: true,
    },
    database: {
      url:
        process.env['DATABASE_URL'] ||
        (() => {
          throw new Error(
            'DATABASE_URL environment variable is required for production'
          );
        })(),
      type: 'supabase',
    },
    features: {
      enableDebugRoutes: false,
    },
    secret: {
      key:
        process.env['API_SECRET'] ||
        (() => {
          throw new Error('API_SECRET environment variable is required');
        })(),
      headerName: 'X-API-Secret',
    },
    jwt: {
      secret:
        process.env['JWT_SECRET'] ||
        (() => {
          throw new Error('JWT_SECRET environment variable is required');
        })(),
      expiresIn: '3m',
      refreshExpiresIn: '30d',
    },
    socialAuth: {
      google: {
        clientId:
          process.env['GOOGLE_CLIENT_ID'] ||
          (() => {
            throw new Error(
              'GOOGLE_CLIENT_ID environment variable is required'
            );
          })(),
      },
      // Apple Sign-In configuration is optional and can be added later
    },
    openai: {
      apiKey:
        process.env['OPENAI_API_KEY'] ||
        (() => {
          throw new Error('OPENAI_API_KEY environment variable is required');
        })(),
      model: process.env['OPENAI_MODEL'] || 'gpt-3.5-turbo',
      maxTokens: parseInt(process.env['OPENAI_MAX_TOKENS'] || '1000', 10),
      temperature: parseFloat(process.env['OPENAI_TEMPERATURE'] || '0.7'),
    },
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
