import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import pingRoutes from './routes/ping';
import userRoutes from './modules/users/routes';
import authRoutes from './modules/auth/routes';
import chatRoutes from './modules/chat/routes';
import config from './config';
import { databaseService } from './database';
import { urlNormalization, secretValidationMiddleware, jsonOnlyMiddleware, inputValidationMiddleware, httpsEnforcementMiddleware, errorHandler } from './middleware';

const app: Application = express();

// Load OpenAPI specification
const swaggerDocument = YAML.load(path.join(__dirname, '../openapi/openapi-consolidated.yaml'));

// API Documentation (Swagger UI) - MUST be before middleware to avoid authentication
if (config.features.enableDebugRoutes) {
  // Serve OpenAPI spec as JSON
  app.get('/api-docs', (_req, res) => {
    res.json(swaggerDocument);
  });
  
  app.use('/docs', swaggerUi.serve as any, swaggerUi.setup(swaggerDocument, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Ditto Server API Documentation'
  }) as any);
}

// URL normalization middleware (handles multiple slashes from API clients) - MUST be first
app.use(urlNormalization);

// HTTPS enforcement middleware - MUST be early for security
app.use(httpsEnforcementMiddleware);

// Security headers middleware - MUST be early for security
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles for Swagger UI
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// Secret validation middleware - MUST be early to protect all routes
app.use(secretValidationMiddleware);

// JSON-only middleware - enforce JSON requests and responses
app.use(jsonOnlyMiddleware);

// Input validation middleware - validate and sanitize input data
app.use(inputValidationMiddleware);

// Middleware
app.use(express.json());
app.use(cors(config.cors));

// Logging middleware (only in non-test environments)
if (config.env !== 'test') {
  app.use((req, _res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - ${req.ip}`);
    next();
  });
}


// Routes
app.use('/ping', pingRoutes);
app.use('/users', userRoutes);
app.use('/auth', authRoutes);
app.use('/chats', chatRoutes);

// Debug routes (only in development and test)
if (config.features.enableDebugRoutes) {
  app.get('/debug/env', (_req, res) => {
    res.json({
      environment: config.env,
      port: config.port,
      features: config.features
    });
  });

  app.get('/debug/last-otp', (_req, res) => {
    const lastOtp = (global as any).lastOtp;
    if (lastOtp) {
      res.json({
        phone: lastOtp.phone,
        otp: lastOtp.otp,
        otpId: lastOtp.otpId
      });
    } else {
      res.json({ message: 'No OTP sent yet' });
    }
  });

  app.get('/debug/error', (_req, _res) => {
    // This will trigger the error handler
    throw new Error('Test error for error handling demonstration');
  });

  app.get('/debug/database', async (_req, res) => {
    try {
      const dbInfo: any = {
        type: config.database.type,
        url: config.database.url,
        hasSupabaseUrl: !!process.env['SUPABASE_URL'],
        hasSupabaseKey: !!process.env['SUPABASE_ANON_KEY'],
        supabaseUrl: process.env['SUPABASE_URL'] ? 'Set' : 'Not set',
        supabaseKey: process.env['SUPABASE_ANON_KEY'] ? 'Set' : 'Not set'
      };

      // Test database connection
      if (config.database.type === 'supabase') {
        try {
          // Try to create a test user to verify connection
          const testUserId = 'test-' + Date.now();
          await databaseService.createUser({
            id: testUserId,
            firstName: 'Test',
            lastName: 'User',
            email: `test-${Date.now()}@example.com`,
            phone: `+1234567890${Date.now()}`
          });
          
          // Clean up test user
          await databaseService.deleteUser(testUserId);
          
          dbInfo.connectionTest = 'SUCCESS - Supabase connection working';
        } catch (error: any) {
          dbInfo.connectionTest = `FAILED - ${error.message}`;
        }
      } else {
        dbInfo.connectionTest = 'SQLite - No connection test needed';
      }

      res.json(dbInfo);
    } catch (error: any) {
      res.status(500).json({
        error: 'Database debug failed',
        message: error.message
      });
    }
  });
}

// 404 handler for undefined routes
app.use('*', (_req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'Resource not found'
  });
});

// Global error handler - MUST be last
app.use(errorHandler);

export default app;
