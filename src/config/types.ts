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
    type: 'sqlite' | 'supabase' | 'in-memory';
  };
  features: {
    enableDebugRoutes: boolean;
  };
  secret: {
    key: string;
    headerName: string;
  };
  jwt: {
    secret: string;
    expiresIn: string;
    refreshExpiresIn: string;
  };
  socialAuth: {
    google: {
      clientId: string;
    };
    apple?: {
      clientId: string;
      teamId: string;
      keyId: string;
      privateKey: string;
    };
  };
}

export type Environment = 'development' | 'staging' | 'production' | 'test';
