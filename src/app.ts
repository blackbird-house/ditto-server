import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import userRoutes from './modules/users/routes';
import authRoutes from './modules/auth/routes';
import chatRoutes from './modules/chat/routes';
import { opsRoutes } from './modules/ops';
import config from './config';
import {
  urlNormalization,
  secretValidationMiddleware,
  jsonOnlyMiddleware,
  inputValidationMiddleware,
  httpsEnforcementMiddleware,
  loggingMiddleware,
  errorHandler,
} from './middleware';

const app: Application = express();

// API Documentation (Swagger UI) - MUST be before middleware to avoid authentication
if (config.features.enableDebugRoutes) {
  try {
    // Load OpenAPI specification
    const swaggerDocument = YAML.load(
      path.join(__dirname, '../openapi/openapi-consolidated.yaml')
    );

    // Serve OpenAPI spec as JSON
    app.get('/api-docs', (_req, res) => {
      res.json(swaggerDocument);
    });

    app.use(
      '/docs',
      swaggerUi.serve as any,
      swaggerUi.setup(swaggerDocument, {
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'Ditto Server API Documentation',
      }) as any
    );
  } catch (error) {
    console.warn(
      '⚠️  OpenAPI documentation not available - openapi/openapi-consolidated.yaml not found'
    );
  }
}

// URL normalization middleware (handles multiple slashes from API clients) - MUST be first
app.use(urlNormalization);

// HTTPS enforcement middleware - MUST be early for security
app.use(httpsEnforcementMiddleware);

// Security headers middleware - MUST be early for security
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles for Swagger UI
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  })
);

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
app.use(loggingMiddleware);

// Routes
app.use('/', opsRoutes);
app.use('/users', userRoutes);
app.use('/auth', authRoutes);
app.use('/chats', chatRoutes);

// 404 handler for undefined routes
app.use('*', (_req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'Resource not found',
  });
});

// Global error handler - MUST be last
app.use(errorHandler);

export default app;
