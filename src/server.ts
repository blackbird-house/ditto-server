import app from './app';
import config from './config';

const PORT = config.port;

// Start server
const server = app.listen(PORT, () => {
  // Only show startup messages in development
  if (config.env === 'development') {
    console.log(`🚀 Ditto Server started in ${config.env} mode`);
    console.log(`📡 Server running on port ${PORT}`);
    console.log(`🔗 Ping endpoint: http://localhost:${PORT}/ping`);
    if (config.features.enableDebugRoutes) {
      console.log(`📚 API Documentation: http://localhost:${PORT}/docs`);
    }
  }
});

// Handle port conflicts - fail immediately if port is in use
server.on('error', (error: any) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use. Please choose a different port or stop the process using this port.`);
    process.exit(1);
  } else {
    console.error('❌ Server error:', error.message);
    process.exit(1);
  }
});

export default app;
