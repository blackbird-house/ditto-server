# Ditto Server

A ready-to-use, easy-to-clone REST API server built with Node.js, TypeScript, and Express. Features user management, authentication, and real-time chat capabilities.

## ✨ Features

- 🔐 **JWT Authentication** with phone-based OTP
- 👥 **User Management** with profile management
- 💬 **1-to-1 Chat System** with privacy controls
- 🗄️ **Multi-Database Support** (SQLite for dev, Supabase for production)
- 🌍 **Multi-Environment** configuration (dev, staging, production)
- 📚 **OpenAPI Documentation** with Swagger UI
- 🧪 **Comprehensive Testing** with Jest
- 🚀 **Production Ready** with proper error handling and security

## 🚀 Quick Start

1. **Clone and install:**
   ```bash
   git clone <repository-url>
   cd ditto-server
   yarn install
   ```

2. **Set up environment:**
   ```bash
   cp env.example .env.development
   # Edit .env.development with your configuration
   ```

3. **Run the server:**
   ```bash
   yarn dev
   ```

4. **Test the API:**
   ```bash
   curl -X GET http://localhost:3000/ping -H "X-API-Secret: dev-secret-key-12345"
   ```

## 📁 Project Structure

```
ditto-server/
├── src/                    # TypeScript source code
│   ├── config/            # Environment configurations
│   ├── middleware/        # Express middleware
│   ├── modules/           # Feature modules (users, auth, chat)
│   ├── database/          # Database layer (SQLite & Supabase)
│   ├── routes/            # API routes
│   └── types/             # TypeScript definitions
├── __tests__/             # Test files
├── openapi/               # API documentation
└── dist/                  # Compiled JavaScript
```

## 🔗 API Endpoints

### Health Check
- **GET** `/ping` - Health check endpoint

### User Management
- **POST** `/users` - Create a new user
- **GET** `/users/me` - Get authenticated user profile
- **PUT** `/users/me` - Update user profile
- **GET** `/users/:id` - Get user by ID

### Authentication
- **POST** `/auth/send-otp` - Send OTP to phone number
- **POST** `/auth/verify-otp` - Verify OTP and get tokens
- **POST** `/auth/refresh-token` - Refresh authentication tokens

### Chat System
- **POST** `/chats` - Create a new chat
- **GET** `/chats` - Get all user chats
- **GET** `/chats/:chatId` - Get specific chat
- **POST** `/chats/:chatId/messages` - Send a message
- **GET** `/chats/:chatId/messages` - Get chat messages

### Documentation
- **GET** `/docs` - Interactive API documentation (Swagger UI)

## 🛠️ Technology Stack

- **Node.js** - Runtime environment
- **TypeScript** - Type-safe JavaScript
- **Express.js** - Web framework
- **SQLite** - Development database
- **Supabase** - Production database (PostgreSQL)
- **JWT** - Authentication tokens
- **Jest** - Testing framework
- **OpenAPI 3.0** - API documentation

## 🌍 Environment Support

- **Development** - SQLite database, debug routes enabled
- **Staging** - SQLite database, production-like configuration
- **Production** - Supabase database, optimized for performance

## 🔐 Security Features

- **API Secret Authentication** - Environment-specific secret keys
- **JWT Token Authentication** - Secure user authentication
- **Phone-based OTP** - Two-factor authentication
- **Row Level Security** - Database-level access control
- **CORS Protection** - Configurable cross-origin policies
- **Input Validation** - Request data validation
- **Error Handling** - Secure error responses

## 📚 Documentation

- **API Documentation** - Available at `/docs` endpoint (Swagger UI)
- **Setup Guide** - See `SETUP_GUIDE.md` for detailed setup instructions
- **Deployment Guide** - See `DEPLOYMENT.md` for deployment instructions
- **Branching Strategy** - See `BRANCHING.md` for Git workflow

## 🧪 Testing

```bash
# Run all tests
yarn test

# Run with coverage
yarn test:coverage

# Run specific environment tests
yarn test:dev
yarn test:staging
yarn test:prod
```

## 🚀 Deployment

The API is designed to be deployed on modern platforms:

- **Railway** (recommended)
- **Render**
- **Vercel**
- **Heroku**

See the setup guide for detailed deployment instructions.

## 📋 Requirements

- Node.js 18+ 
- Yarn package manager
- Environment variables configured (see setup guide)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For setup and configuration help, see:
- `SETUP_GUIDE.md` - Detailed setup instructions
- `DEPLOYMENT.md` - Deployment guide
- API documentation at `/docs` endpoint

---

**Ready to build your next API?** Clone this repository and start building! 🚀
