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

The server will start on `http://localhost:${PORT}` (default port: 3000)

## 📁 Project Structure

```
ditto-server/
├── src/               # TypeScript source code
│   ├── config/        # Environment configurations
│   │   └── index.ts   # Environment-specific settings
│   ├── middleware/    # Express middleware
│   │   ├── index.ts   # Middleware exports
│   │   └── urlNormalization.ts # URL normalization middleware
│   ├── routes/        # API endpoint modules
│   │   └── ping.ts    # Health check endpoint
│   ├── modules/       # Feature modules
│   │   └── users/     # User management module
│   │       ├── types.ts      # User type definitions
│   │       ├── service.ts    # User business logic (in-memory store)
│   │       ├── controller.ts # User HTTP handlers
│   │       └── routes.ts     # User routes
│   ├── types/         # TypeScript type definitions
│   │   └── index.ts   # Shared types and interfaces
│   ├── app.ts         # Express app configuration
│   └── server.ts      # Server startup
├── dist/              # Compiled JavaScript (generated)
├── __tests__/         # Test files
│   ├── ping.test.ts   # Ping endpoint tests
│   ├── server.test.ts # Server configuration tests
│   ├── environments.test.ts # Environment tests
│   ├── rate-limiting.test.ts # Rate limiting tests
│   └── users.test.ts  # User module tests
├── package.json       # Project dependencies and scripts
├── tsconfig.json      # TypeScript configuration
├── jest.config.js     # Jest testing configuration
├── yarn.lock         # Yarn lockfile
├── env.example       # Environment variables template
├── railway.json      # Production deployment config
├── railway.staging.json # Staging deployment config
├── railway.dev.json  # Development deployment config
├── openapi.yaml      # API specification
├── api-access.paw    # Paw API client for testing
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

### User Management
- **POST** `/users` - Create a new user
- **PUT** `/users/:id` - Update user by ID
- **GET** `/users/:id` - Get user by ID

### Debug (Development Only)
- **GET** `/debug/env` - Returns environment configuration (dev only)

### API Documentation (Development Only)
- **GET** `/docs` - Interactive Swagger UI documentation (dev/test only)

## 🧪 API Testing

### Paw API Client
The project includes `api-access.paw` - a Paw API client file for easy endpoint testing:

- **File**: `api-access.paw` (in project root)
- **Purpose**: Pre-configured API requests for all endpoints
- **Usage**: Import into Paw app to quickly test endpoints
- **Features**: 
  - Pre-configured requests for `/ping` and `/debug/env`
  - Environment-specific configurations
  - Ready-to-use headers and parameters

To use the API client:
1. Open Paw app
2. Import the `api-access.paw` file
3. Select the appropriate environment (development/staging/production)
4. Run requests to test endpoints

## 🛠️ Technology Stack

- **Node.js** - Runtime environment
- **TypeScript** - Type-safe JavaScript
- **Express.js** - Web framework
- **Yarn** - Package manager
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - Request throttling
- **Environment Configuration** - Multi-environment support
- **Swagger UI** - Interactive API documentation
- **OpenAPI 3.0** - API specification standard
- **Jest** - Testing framework
- **Supertest** - HTTP testing
- **Node.js Crypto** - UUID generation (built-in)
- **In-Memory Storage** - Development data persistence
- **Custom Middleware** - URL normalization for API client compatibility

## 🌍 Environment Configuration

### Development Environment
- **Purpose**: Unreliable playground for backend engineers
- **Features**: Debug routes, experimental features, mock data, detailed startup logs
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
- **Features**: Optimized for performance and security, minimal startup logs
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


## 📋 TODO

- [ ] Add more API endpoints as needed
- [ ] Implement middleware for logging, authentication, etc.
- [ ] Add database integration
- [x] Add comprehensive testing suite
- [x] Convert to TypeScript
- [x] Add API documentation (Swagger/OpenAPI) ✅

