export interface EnvironmentConfig {
  port: number;
  env: string;
  logLevel: string;
  cors: {
    origin: string[];
    credentials: boolean;
  };
  rateLimit: {
    windowMs: number;
    max: number;
  };
  database: {
    url: string;
    type: 'sqlite' | 'mongodb' | 'postgresql';
  };
  features: {
    enableDebugRoutes: boolean;
    enableMockData: boolean;
    enableExperimentalFeatures: boolean;
  };
}

export type Environment = 'development' | 'staging' | 'production' | 'test';
