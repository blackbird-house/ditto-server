# ditto-server

A ready-to-use easy-to-clone REST API server built with Node.js and Express.

## 🚀 Quick Start

```bash
# Install dependencies
yarn install

# Development environment (unreliable, for BE engineers to play with)
yarn dev

# Build TypeScript to JavaScript
yarn build

# Staging environment (stable, pre-production)
yarn staging

# Production environment (customer-facing)
yarn start

# Type checking
yarn type-check
```

The server will start on `http://localhost:3000`

## 📁 Project Structure

```
ditto-server/
├── src/               # TypeScript source code
│   ├── config/        # Environment configurations
│   │   └── index.ts   # Environment-specific settings
│   ├── routes/        # API endpoint modules
│   │   └── ping.ts    # Health check endpoint
│   ├── types/         # TypeScript type definitions
│   │   └── index.ts   # Shared types and interfaces
│   ├── app.ts         # Express app configuration
│   └── server.ts      # Server startup
├── dist/              # Compiled JavaScript (generated)
├── __tests__/         # Test files
│   ├── ping.test.ts   # Ping endpoint tests
│   ├── server.test.ts # Server configuration tests
│   ├── environments.test.ts # Environment tests
│   └── rate-limiting.test.ts # Rate limiting tests
├── package.json       # Project dependencies and scripts
├── tsconfig.json      # TypeScript configuration
├── jest.config.js     # Jest testing configuration
├── yarn.lock         # Yarn lockfile
├── env.example       # Environment variables template
├── railway.json      # Production deployment config
├── railway.staging.json # Staging deployment config
├── railway.dev.json  # Development deployment config
├── openapi.yaml      # API specification
├── DEPLOYMENT.md     # Deployment instructions
├── BRANCHING.md      # Git branching strategy
├── .gitignore        # Git ignore rules
└── README.md         # This file
```

## 🌿 Git Branching Strategy

This project follows a **Git Flow** strategy with three main branches:

- **`develop`** - Active development (unreliable, for testing)
- **`staging`** - Pre-production (stable, ready for testing)
- **`main`** - Production (customer-facing, stable)

### **Workflow:**
```
develop → staging → main
```

### **Branch Usage:**
- **New features** → Develop in `develop` branch
- **Ready for testing** → Promote to `staging` branch
- **Ready for release** → Promote to `main` branch

See [BRANCHING.md](./BRANCHING.md) for detailed branching strategy and commands.

## 🔗 Available Endpoints

### Health Check
- **GET** `/ping` - Returns 204 No Content (health check)

### Debug (Development Only)
- **GET** `/debug/env` - Returns environment configuration (dev only)

## 🛠️ Technology Stack

- **Node.js** - Runtime environment
- **TypeScript** - Type-safe JavaScript
- **Express.js** - Web framework
- **Yarn** - Package manager
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - Request throttling
- **Environment Configuration** - Multi-environment support
- **Jest** - Testing framework
- **Supertest** - HTTP testing

## 🌍 Environment Configuration

### Development Environment
- **Purpose**: Unreliable playground for backend engineers
- **Features**: Debug routes, experimental features, mock data
- **Rate Limit**: 1000 requests/15min
- **Log Level**: Debug
- **Start**: `yarn dev`

### Staging Environment
- **Purpose**: Stable pre-production environment
- **Features**: Production-like but with testing capabilities
- **Rate Limit**: 500 requests/15min
- **Log Level**: Info
- **Start**: `yarn staging`

### Production Environment
- **Purpose**: Customer-facing stable environment
- **Features**: Optimized for performance and security
- **Rate Limit**: 100 requests/15min
- **Log Level**: Warn
- **Start**: `yarn start`

## 📝 Development

This project uses a modular route structure for easy scalability. To add new endpoints:

1. Create a new route file in the `routes/` directory
2. Import and register the route in `server.js`
3. Update this README with the new endpoint documentation

## 🚀 Deployment

### Railway (Recommended)
1. Push your code to GitHub
2. Sign up at [railway.app](https://railway.app)
3. Connect your GitHub repository
4. Deploy automatically - Railway will detect the Node.js app
5. Your API will be available at `https://your-app-name.railway.app`

### Render
1. Push your code to GitHub
2. Sign up at [render.com](https://render.com)
3. Create a new Web Service
4. Connect your GitHub repository
5. Deploy - your API will be available at `https://your-app-name.onrender.com`

### Testing with RapidAPI
Once deployed, you can test your API with RapidAPI:
1. Go to [RapidAPI Provider Dashboard](https://rapidapi.com/provider)
2. Add your deployed API URL as the base URL
3. Test the `/ping` endpoint

## 🧪 Testing

### Running Tests
```bash
# Run all tests
yarn test

# Run tests for specific environments
yarn test:dev      # Development environment tests
yarn test:staging  # Staging environment tests
yarn test:prod     # Production environment tests

# Run tests with coverage
yarn test:coverage

# Run tests in watch mode
yarn test:watch
```

### Test Coverage
- **70.27%** Statement coverage
- **83.33%** Branch coverage
- **75%** Function coverage
- **70.27%** Line coverage

### Latest Test Results
- ✅ **4 test suites passed**
- ✅ **27 tests passed**
- ✅ **0 test failures**
- ✅ **All environments tested** (development, staging, production, test)

### Test Structure
- `__tests__/ping.test.ts` - Ping endpoint tests
- `__tests__/server.test.ts` - Server configuration tests
- `__tests__/environments.test.ts` - Environment-specific tests
- `__tests__/rate-limiting.test.ts` - Rate limiting tests

## 📋 TODO

- [ ] Add more API endpoints as needed
- [ ] Implement middleware for logging, authentication, etc.
- [ ] Add database integration
- [x] Add comprehensive testing suite
- [x] Convert to TypeScript
- [ ] Add API documentation (Swagger/OpenAPI)

## 📊 Project Status

**Last Updated:** September 14, 2025  
**Current Branch:** `develop`  
**Test Status:** ✅ All tests passing (27/27)  
**TypeScript:** ✅ Fully converted and type-safe  
**Environments:** ✅ All 4 environments configured and tested  
**Coverage:** ✅ 70.27% statement coverage, 83.33% branch coverage  
**Branching:** ✅ Git Flow strategy implemented (develop → staging → main)
