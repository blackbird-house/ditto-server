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
│   │   ├── urlNormalization.ts # URL normalization middleware
│   │   ├── auth.ts    # JWT authentication middleware
│   │   ├── secretValidation.ts # API secret validation middleware
│   │   ├── jsonOnly.ts # JSON-only request/response enforcement
│   │   └── errorHandler.ts # Global error handling middleware
│   ├── routes/        # API endpoint modules
│   │   └── ping.ts    # Health check endpoint
│   ├── modules/       # Feature modules
│   │   ├── users/     # User management module
│   │   │   ├── types.ts      # User type definitions
│   │   │   ├── service.ts    # User business logic (in-memory store)
│   │   │   ├── controller.ts # User HTTP handlers
│   │   │   └── routes.ts     # User routes
│   │   ├── auth/      # Authentication module
│   │   │   ├── types.ts      # Auth type definitions
│   │   │   ├── controller.ts # Auth HTTP handlers
│   │   │   ├── routes.ts     # Auth routes
│   │   │   └── services/     # Auth services
│   │   │       ├── authService.ts    # Core auth logic
│   │   │       └── mockOtpService.ts # Mock OTP service
│   │   └── chat/      # Chat messaging module
│   │       ├── types.ts      # Chat type definitions
│   │       ├── service.ts    # Chat business logic
│   │       ├── controller.ts # Chat HTTP handlers
│   │       └── routes.ts     # Chat routes
│   ├── database/      # Database layer
│   │   ├── index.ts   # Database service abstraction
│   │   └── sqlite.ts  # SQLite database implementation
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
│   ├── auth.test.ts   # Authentication module tests
│   ├── chat.test.ts   # Chat messaging module tests
│   ├── secretValidation.test.ts # API secret validation tests
│   ├── jsonOnly.test.ts # JSON-only enforcement tests
│   └── errorHandler.test.ts # Global error handling tests
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

## 🗄️ Database Configuration

### Development Environment
- **Database Type**: SQLite (file-based)
- **Location**: `./data/ditto-dev.db`
- **Setup**: No external setup required - database is created automatically
- **Features**: 
  - Automatic table creation on startup
  - Persistent data storage
  - Easy to reset (delete the .db file)

### Production Environment
- **Database Type**: MongoDB (configurable)
- **Configuration**: Set `DATABASE_URL` environment variable
- **Examples**:
  - MongoDB: `mongodb://localhost:27017/ditto-prod`
  - PostgreSQL: `postgresql://user:password@localhost:5432/ditto_prod`

### Database Schema
- **Users Table**: Stores user information (id, firstName, lastName, email, phone, timestamps)
- **OTP Sessions Table**: Stores OTP verification sessions (id, phone, otp, expiresAt, createdAt)

## 🔗 Available Endpoints

### Health Check
- **GET** `/ping` - Returns 204 No Content (health check)

### User Management
- **POST** `/users` - Create a new user
- **GET** `/users/me` - Get authenticated user profile (requires authentication)
- **PUT** `/users/me` - Update authenticated user profile (requires authentication)
- **GET** `/users/:id` - Get user by ID (returns only id, firstName, lastName - requires authentication)

### Authentication
- **POST** `/auth/send-otp` - Send OTP to phone number (returns 204)
- **POST** `/auth/verify-otp` - Verify OTP and get authentication token

### Chat (1-to-1 Messaging)
- **POST** `/chats` - Create a new chat with another user (requires authentication)
- **GET** `/chats` - Get all chats for authenticated user (requires authentication)
- **GET** `/chats/:chatId` - Get specific chat with all messages (requires authentication)
- **POST** `/chats/:chatId/messages` - Send a message to a chat (requires authentication)
- **GET** `/chats/:chatId/messages` - Get all messages from a chat (requires authentication)

### Debug (Development Only)
- **GET** `/debug/env` - Returns environment configuration (dev only)
- **GET** `/debug/last-otp` - Get last generated OTP for testing (dev only)

### API Documentation (Development Only)
- **GET** `/docs` - Interactive Swagger UI documentation (returns HTML, dev/test only)

## 💬 Chat System

The API includes a simple 1-to-1 chat system with strong privacy controls:

### **Privacy & Security**
- **User Isolation**: Each user can only see their own chats
- **Access Control**: Users can only access chats where they are a participant
- **Message Privacy**: Users can only view messages from chats they participate in
- **Authentication Required**: All chat endpoints require valid JWT authentication

### **Chat Features**
- **Create Chats**: Start a new conversation with another user
- **List Chats**: View all your conversations with last message preview
- **View Chat**: Get full chat history with all messages
- **Send Messages**: Send messages up to 1000 characters
- **Message History**: Retrieve all messages from a specific chat

### **Usage Example**
```bash
# 1. Create a chat with another user
curl -X POST http://localhost:3000/chats \
  -H "X-API-Secret: dev-secret-key-12345" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"participantId": "other-user-id"}'

# 2. Send a message
curl -X POST http://localhost:3000/chats/CHAT_ID/messages \
  -H "X-API-Secret: dev-secret-key-12345" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content": "Hello, how are you?"}'

# 3. Get all your chats
curl -X GET http://localhost:3000/chats \
  -H "X-API-Secret: dev-secret-key-12345" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

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
- **API Secret Validation** - Environment-specific secret key authentication
- **JSON-Only Enforcement** - Middleware to enforce JSON requests and responses
- **Global Error Handling** - Comprehensive error handling with consistent JSON responses
- **SQLite Database** - File-based database for development and testing
- **1-to-1 Chat System** - Private messaging between users with privacy controls
- **Message Privacy** - Users can only access their own chats and messages

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

## 📋 API Requirements

### **JSON-Only Format**
This API **only accepts and returns JSON format** (except for `/docs` which returns HTML):

- **Requests**: All requests with a body must have `Content-Type: application/json` header
- **Responses**: All responses are returned in JSON format with `Content-Type: application/json`
- **Exception**: `/docs` endpoint returns HTML for Swagger UI
- **Error Handling**: Invalid content types return a 400 Bad Request error

#### **Example Usage**
```bash
# ❌ This will return 400 Bad Request
curl -X POST http://localhost:3000/users \
  -H "X-API-Secret: dev-secret-key-12345" \
  -d '{"firstName":"John","lastName":"Doe"}'

# ✅ This will work
curl -X POST http://localhost:3000/users \
  -H "X-API-Secret: dev-secret-key-12345" \
  -H "Content-Type: application/json" \
  -d '{"firstName":"John","lastName":"Doe","email":"john@example.com","phone":"+1234567890"}'
```

#### **Error Response for Invalid Content-Type**
```json
{
  "error": "Bad Request",
  "message": "Content-Type must be application/json",
  "code": "INVALID_CONTENT_TYPE"
}
```

## 🔐 Authentication

The API uses a two-layer authentication system:

### **1. API Secret Authentication (Required for Most Requests)**
Most API requests must include a valid secret header:

- **Header**: `X-API-Secret`
- **Purpose**: Prevents unauthorized access to the API
- **Environment-Specific**: Each environment has its own secret key
- **Excluded Endpoints**: `/docs` and `/debug/*` endpoints don't require the secret header

#### **Environment Secret Keys**
- **Development**: `dev-secret-key-12345`
- **Test**: `test-secret-key-67890`
- **Staging**: `staging-secret-key-abcdef`
- **Production**: `prod-secret-key-xyz789`

#### **Example Usage**
```bash
# ❌ This will return 401 Unauthorized
curl -X GET http://localhost:3000/ping

# ✅ This will work
curl -X GET http://localhost:3000/ping -H "X-API-Secret: dev-secret-key-12345"

# ✅ Debug endpoints work without secret header
curl -X GET http://localhost:3000/debug/env
curl -X GET http://localhost:3000/docs
```

### **2. User Authentication (Phone-based OTP)**
For user-specific operations, the API uses phone-based OTP authentication:

#### **Authentication Flow**
1. **Register**: `POST /users` (create user account)
2. **Request OTP**: `POST /auth/send-otp` (send OTP to phone)
3. **Verify OTP**: `POST /auth/verify-otp` (get authentication token)
4. **Use Token**: Include `Authorization: Bearer <token>` header for protected endpoints

#### **Protected Endpoints**
- `GET /users/me` - Get authenticated user profile
- `PUT /users/me` - Update authenticated user profile
- `GET /users/:id` - Get user by ID (returns only public info)

#### **Token Details**
- **Format**: JWT (base64 encoded)
- **Expiration**: 5 minutes
- **Header**: `Authorization: Bearer <token>`

#### **Development OTP**
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
  - Invalid content type: `{"error":"Bad Request","message":"Content-Type must be application/json","code":"INVALID_CONTENT_TYPE"}`
  - Missing required fields: `{"error":"Bad Request","message":"Missing required field: email"}`
- **401** - Unauthorized (missing/invalid authentication)
  - Missing API secret: `{"error":"Unauthorized","message":"Missing required header: X-API-Secret","code":"MISSING_SECRET_HEADER"}`
  - Invalid API secret: `{"error":"Unauthorized","message":"Invalid API secret","code":"INVALID_SECRET"}`
  - Invalid/missing JWT token: `{"error":"Unauthorized","message":"Invalid or missing authentication token"}`
- **404** - Not Found (resource doesn't exist)
- **409** - Conflict (duplicate data)
- **429** - Too Many Requests (rate limit exceeded)
- **500** - Internal Server Error
  - Standard response: `{"error":"Internal Server Error","message":"An unexpected error occurred. Please try again later.","code":"INTERNAL_SERVER_ERROR"}`
  - Development/Test (includes debugging): `{"error":"Internal Server Error","message":"An unexpected error occurred. Please try again later.","code":"INTERNAL_SERVER_ERROR","details":"Specific error message","stack":"Full error stack trace"}`

### **Global Error Handler**
The API includes a comprehensive error handling system:

#### **404 Handler**
All undefined routes return a proper JSON 404 response instead of HTML error pages:
```json
{
  "error": "Not found",
  "message": "Cannot PUT /users/some-id"
}
```

#### **500 Error Handler**
All unhandled errors and server crashes are caught by a global error handler that:
- Returns consistent 500 JSON responses
- Logs detailed error information (development/test only)
- Includes debugging details in development/test environments
- Prevents server crashes from exposing sensitive information
- Maintains JSON response format even during errors

#### **Debug Endpoint**
For testing error handling, use the debug endpoint (development only):
```bash
curl -X GET http://localhost:3000/debug/error
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
- [x] Add database integration ✅
- [x] Add comprehensive testing suite ✅
- [x] Convert to TypeScript ✅
- [x] Add API documentation (Swagger/OpenAPI) ✅
- [x] Implement phone-based OTP authentication ✅
- [x] Add user management with authentication ✅
- [x] Add proper error handling (JSON responses) ✅
- [x] Add authentication middleware ✅
- [x] Add API secret validation ✅
- [x] Add JSON-only request/response enforcement ✅

