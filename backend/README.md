# Bharat Shops Hub Clone - Backend API

A production-ready authentication system clone with role-based access control, Google OAuth 2.0 integration, and comprehensive security features.

**This is a clone project to avoid conflicts with the original Bharat Shops Hub repository.**

## 🚀 Features

### 🔐 Authentication
- **Email/Password Authentication** with bcrypt hashing
- **Role-based Access Control** (Customer, Merchant, Rider)
- **JWT Access Tokens** (15 minutes) + **Refresh Tokens** (30 days)
- **HTTP-only Secure Cookies** for token storage
- **Token Rotation** - Refresh tokens rotate on every use
- **Demo Users** - Pre-configured users for all roles

### 🛡️ Security
- **Rate Limiting** on all endpoints
- **Helmet** security headers
- **CORS** with credentials support
- **Input Validation** with Zod schemas
- **Audit Logging** for security tracking
- **Secure Cookie Management**

### 🏗️ Architecture
- **TypeScript** for type safety
- **Express.js** for API framework
- **Prisma** with PostgreSQL for database
- **Pino** for structured logging
- **Modular Design** with clear separation of concerns

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL database

## 🛠️ Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp env.example .env
   ```
   
   Update `.env` with your configuration:
   ```env
   # Server Configuration
   PORT=3001
   NODE_ENV=development

   # Database Configuration
   DATABASE_URL="postgresql://username:password@localhost:5432/bharat_shops_hub_clone"

   # JWT Configuration
   JWT_ACCESS_SECRET=your-super-secret-jwt-access-key-change-in-production-2024
   JWT_REFRESH_SECRET=your-super-secret-jwt-refresh-key-change-in-production-2024
   ACCESS_TOKEN_TTL_MIN=15
   REFRESH_TOKEN_TTL_DAYS=30

   # Cookie Configuration
   COOKIE_SECRET=your-cookie-secret-key-change-in-production-2024
   COOKIE_DOMAIN=localhost
   COOKIE_SECURE=false

   # CORS Configuration
   VITE_WEB_ORIGIN=http://localhost:8081

   

   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   AUTH_RATE_LIMIT_MAX_REQUESTS=5
   AUTH_RATE_LIMIT_WINDOW_MS=900000

   # Logging
   LOG_LEVEL=info
   ```

3. **Set up database:**
   ```bash
   # Generate Prisma client
   npm run db:generate

   # Run database migrations
   npm run db:migrate

   # Seed database with demo users
npm run db:seed
   ```

4. **Demo Users:**
   The application comes with pre-configured demo users for all roles:

   **Customers:**
   - Email: `customer1@demo.com` | Password: `Demo123!`
   - Email: `customer2@demo.com` | Password: `Demo123!`

   **Merchants:**
   - Email: `merchant1@demo.com` | Password: `Demo123!`
   - Email: `merchant2@demo.com` | Password: `Demo123!`

   **Riders:**
   - Email: `rider1@demo.com` | Password: `Demo123!`
   - Email: `rider2@demo.com` | Password: `Demo123!`

5. **Start the server:**
   ```bash
   # Development
   npm run dev

   # Production
   npm run build
   npm start
   ```

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  password_hash TEXT, -- NULL for OAuth-only users
  role TEXT NOT NULL DEFAULT 'CUSTOMER',
  email_verified BOOLEAN DEFAULT FALSE,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Refresh Tokens Table
```sql
CREATE TABLE refresh_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT UNIQUE NOT NULL,
  user_agent TEXT,
  ip_address TEXT,
  is_revoked BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```



## 🔌 API Endpoints

### Authentication Endpoints

#### Email/Password Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Token refresh
- `POST /api/auth/logout` - Single session logout
- `POST /api/auth/logout-all` - Revoke all user sessions
- `GET /api/auth/me` - Get current user info



#### Health Check
- `GET /api/auth/health` - Service health check

### Request/Response Examples

#### Register User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123",
  "name": "John Doe",
  "role": "CUSTOMER"
}
```

#### Login User
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123",
  "role": "CUSTOMER"
}
```

#### Get User Profile
```bash
GET /api/auth/me
Authorization: Bearer <access_token>
```

## 🔧 Development

### Available Scripts
```bash
# Development
npm run dev              # Start development server with hot reload
npm run build           # Build for production
npm run start           # Start production server

# Database
npm run db:generate     # Generate Prisma client
npm run db:migrate      # Run database migrations
npm run db:studio       # Open Prisma Studio
npm run db:seed         # Seed database
npm run db:reset        # Reset database

# Code Quality
npm run lint            # Run ESLint
npm run lint:fix        # Fix ESLint issues
npm test               # Run tests
```

### Project Structure
```
src/
├── config/           # Configuration files
│   ├── database.ts   # Prisma client setup
│   └── google.ts     # Google OAuth configuration
├── controllers/      # Request handlers
│   └── authController.ts
├── middleware/       # Express middleware
│   ├── auth.ts       # Authentication middleware
│   ├── rateLimit.ts  # Rate limiting
│   └── errorHandler.ts
├── routes/           # API routes
│   ├── auth.ts       # Authentication routes
│   └── auth.google.ts # OAuth routes
├── services/         # Business logic
│   └── authService.ts
├── types/            # TypeScript types
│   └── auth.ts
├── utils/            # Utility functions
│   ├── jwt.ts        # JWT utilities
│   ├── cookies.ts    # Cookie management
│   └── logger.ts     # Logging utilities
├── scripts/          # Database scripts
│   └── seed.ts
└── index.ts          # Main application file
```

## 🔐 Security Features

### Rate Limiting
- **General API**: 100 requests per 15 minutes
- **Authentication**: 5 attempts per 15 minutes
- **Registration**: 3 attempts per hour
- **OAuth**: 10 attempts per 15 minutes

### Token Security
- **Access Tokens**: 15-minute expiration
- **Refresh Tokens**: 30-day expiration with rotation
- **Token Storage**: SHA-256 hashed in database
- **Secure Cookies**: HTTP-only, SameSite=strict



## 🚀 Production Deployment

### Environment Variables
Update all environment variables for production:
- Set `NODE_ENV=production`
- Use strong, unique secrets for JWT and cookies
- Configure proper CORS origins
- Set up HTTPS with proper cookie domains

### Database
- Use a production PostgreSQL instance
- Set up proper database backups
- Configure connection pooling

### Security Headers
The application includes Helmet for security headers:
- Content Security Policy
- X-Frame-Options
- X-Content-Type-Options
- And more...

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection**: Check PostgreSQL is running and credentials are correct

3. **CORS Errors**: Ensure `VITE_WEB_ORIGIN` matches your frontend URL
4. **Cookie Issues**: Ensure domain and secure settings match your environment

### Debug Mode
Set `LOG_LEVEL=debug` for detailed logging.

## 📝 License

MIT License - see LICENSE file for details.
