import express, { Application } from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import pingRoutes from './routes/ping';
import userRoutes from './modules/users/routes';
import authRoutes from './modules/auth/routes';
import chatRoutes from './modules/chat/routes';
import config from './config';
import { urlNormalization, secretValidationMiddleware, jsonOnlyMiddleware, errorHandler } from './middleware';

const app: Application = express();

// Load OpenAPI specification
const swaggerDocument = YAML.load(path.join(__dirname, '../openapi.yaml'));

// URL normalization middleware (handles multiple slashes from API clients) - MUST be first
app.use(urlNormalization);

// Secret validation middleware - MUST be early to protect all routes
app.use(secretValidationMiddleware);

// JSON-only middleware - enforce JSON requests and responses
app.use(jsonOnlyMiddleware);

// Middleware
app.use(express.json());
app.use(cors(config.cors));

// Rate limiting
const limiter = rateLimit(config.rateLimit);
app.use(limiter);

// Logging middleware
app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - ${req.ip}`);
  next();
});

// API Documentation (Swagger UI) - only in development and test
if (config.features.enableDebugRoutes) {
  app.use('/docs', swaggerUi.serve as any, swaggerUi.setup(swaggerDocument, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Ditto Server API Documentation'
  }) as any);
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
}

// 404 handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Global error handler - MUST be last
app.use(errorHandler);

export default app;
