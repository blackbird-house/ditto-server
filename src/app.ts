import express, { Application } from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import pingRoutes from './routes/ping';
import userRoutes from './modules/users/routes';
import config from './config';
import { urlNormalization } from './middleware/urlNormalization';

const app: Application = express();

// Load OpenAPI specification
const swaggerDocument = YAML.load(path.join(__dirname, '../openapi.yaml'));

// URL normalization middleware (handles multiple slashes from API clients) - MUST be first
app.use(urlNormalization);

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

// Debug routes (only in development and test)
if (config.features.enableDebugRoutes) {
  app.get('/debug/env', (_req, res) => {
    res.json({
      environment: config.env,
      port: config.port,
      features: config.features
    });
  });
}

export default app;
