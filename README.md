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
│   │   ├── users/     # User management module
│   │   │   ├── types.ts      # User type definitions
│   │   │   ├── service.ts    # User business logic (in-memory store)
│   │   │   ├── controller.ts # User HTTP handlers
│   │   │   └── routes.ts     # User routes
│   │   └── auth/      # Authentication module
│   │       ├── types.ts      # Auth type definitions
│   │       ├── controller.ts # Auth HTTP handlers
│   │       ├── routes.ts     # Auth routes
│   │       └── services/     # Auth services
│   │           ├── authService.ts    # Core auth logic
│   │           └── mockOtpService.ts # Mock OTP service
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
│   ├── users.test.ts  # User module tests
│   └── auth.test.ts   # Authentication module tests
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
- **GET** `/users/me` - Get authenticated user profile (requires authentication)
- **PUT** `/users/me` - Update authenticated user profile (requires authentication)
- **GET** `/users/:id` - Get user by ID (public)

### Authentication
- **POST** `/auth/send-otp` - Send OTP to phone number (returns 204)
- **POST** `/auth/verify-otp` - Verify OTP and get authentication token

### Debug (Development Only)
- **GET** `/debug/env` - Returns environment configuration (dev only)
- **GET** `/debug/last-otp` - Get last generated OTP for testing (dev only)

### API Documentation (Development Only)
- **GET** `/docs` - Interactive Swagger UI documentation (dev/test only)

## 🧪 API Testing

### Paw API Client
The project includes `api-access.paw` - a Paw API client file for easy endpoint testing:

- **File**: `api-access.paw` (in project root)
- **Purpose**: Pre-configured API requests for all endpoints
- **Usage**: Import into Paw app to quickly test endpoints
- **Features**: 
  - Pre-configured requests for all endpoints
  - Environment-specific configurations
  - Ready-to-use headers and parameters
  - Authentication token handling

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
- **JWT Authentication** - Token-based authentication (base64 encoded)
- **OTP Service** - Phone-based one-time password authentication
- **Mock Services** - Development-friendly mock implementations

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

## 🔐 Authentication

The API uses phone-based OTP (One-Time Password) authentication:

### **Authentication Flow**
1. **Register**: `POST /users` (create user account)
2. **Request OTP**: `POST /auth/send-otp` (send OTP to phone)
3. **Verify OTP**: `POST /auth/verify-otp` (get authentication token)
4. **Use Token**: Include `Authorization: Bearer <token>` header for protected endpoints

### **Protected Endpoints**
- `GET /users/me` - Get authenticated user profile
- `PUT /users/me` - Update authenticated user profile

### **Token Details**
- **Format**: JWT (base64 encoded)
- **Expiration**: 5 minutes
- **Header**: `Authorization: Bearer <token>`

### **Development OTP**
In development, the OTP is the last 6 digits of the phone number (e.g., phone `+1234567890` → OTP `567890`)

## ⚠️ Error Handling

The API returns consistent JSON error responses for all error scenarios:

### **Error Response Format**
```json
{
  "error": "Error Type",
  "message": "Detailed error message"
}
```

### **Common Error Codes**
- **400** - Bad Request (missing/invalid data)
- **401** - Unauthorized (missing/invalid authentication)
- **404** - Not Found (resource doesn't exist)
- **409** - Conflict (duplicate data)
- **429** - Too Many Requests (rate limit exceeded)
- **500** - Internal Server Error

### **404 Handler**
All undefined routes return a proper JSON 404 response instead of HTML error pages:
```json
{
  "error": "Not found",
  "message": "Cannot PUT /users/some-id"
}
```

## 📝 Development

This project uses a modular route structure for easy scalability. To add new endpoints:

1. Create a new route file in the `modules/` directory
2. Import and register the route in `src/app.ts`
3. Update this README with the new endpoint documentation
4. Add tests in the `__tests__/` directory

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
- [ ] Add database integration
- [x] Add comprehensive testing suite
- [x] Convert to TypeScript
- [x] Add API documentation (Swagger/OpenAPI) ✅
- [x] Implement phone-based OTP authentication ✅
- [x] Add user management with authentication ✅
- [x] Add proper error handling (JSON responses) ✅
- [x] Add authentication middleware ✅

