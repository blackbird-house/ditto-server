export interface EnvironmentConfig {
  port: number;
  env: string;
  logLevel: string;
  cors: {
    origin: string[];
    credentials: boolean;
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
  secret: {
    key: string;
    headerName: string;
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
}

export type Environment = 'development' | 'staging' | 'production' | 'test';
