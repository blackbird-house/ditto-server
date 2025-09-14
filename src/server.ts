import app from './app';
import config from './config';

const PORT = config.port;

// Start server
app.listen(PORT, () => {
  // Only show startup messages in development
  if (config.env === 'development') {
    console.log(`🚀 Ditto Server started in ${config.env} mode`);
    console.log(`📡 Server running on port ${PORT}`);
    console.log(`🔗 Ping endpoint: http://localhost:${PORT}/ping`);
    if (config.features.enableDebugRoutes) {
      console.log(`📚 API Documentation: http://localhost:${PORT}/docs`);
      console.log(`🐛 Debug endpoint: http://localhost:${PORT}/debug/env`);
    }
    console.log(`📊 Rate limit: ${config.rateLimit.max} requests per ${config.rateLimit.windowMs/1000/60} minutes`);
  }
});

export default app;
