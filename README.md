# Bharat Shops Hub Clone - Complete E-commerce Platform

A production-ready e-commerce platform clone with role-based authentication, Google OAuth 2.0 integration, and comprehensive security features. Built with React, Express.js, Prisma, PostgreSQL, and TypeScript.

**This is a clone project to avoid conflicts with the original Bharat Shops Hub repository.**

## Features

### 🔐 Authentication
- **Email/Password Authentication** with bcrypt hashing
- **JWT Access Tokens** (15 minutes) + **Rotating Refresh Tokens** (30 days)
- **HTTP-only Secure Cookies** for all tokens (no client-side JWT handling)
- **Demo Users** - Pre-configured users for all roles (Customer, Merchant, Rider)

### 🛡️ Security
- **Rate Limiting** on authentication endpoints
- **Helmet** security headers
- **CORS** with credentials support
- **Token Rotation** - Refresh tokens rotate on every use
- **Forced Logout** - Support for revoking all user tokens

### 🏗️ Architecture
- **TypeScript** for both frontend and backend
- **Prisma** with PostgreSQL for database operations
- **Zod** validation for all request bodies
- **Pino** structured logging
- **Cookie-based Authentication** with proper security settings

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd bharat-shops-hub

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
```

### 2. Environment Configuration

#### Backend Environment (`.env`)

```bash
# Copy the example file
cp backend/env.example backend/.env
```

Update `backend/.env` with your configuration:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/bharat_shops_hub"

# JWT Configuration
JWT_ACCESS_SECRET=your-super-secret-jwt-access-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-jwt-refresh-key-change-in-production
ACCESS_TOKEN_TTL_MIN=15
REFRESH_TOKEN_TTL_DAYS=30

# Cookie Configuration
COOKIE_SECRET=your-cookie-secret-key-change-in-production
COOKIE_DOMAIN=localhost
COOKIE_SECURE=false

# CORS Configuration
VITE_WEB_ORIGIN=http://localhost:8080

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
AUTH_RATE_LIMIT_MAX_REQUESTS=5
AUTH_RATE_LIMIT_WINDOW_MS=900000



# OAuth State Management
STATE_SECRET=your-state-secret-key-change-in-production
```

#### Frontend Environment (`.env`)

```bash
# Copy the example file
cp .env.example .env
```

Update `.env` with your configuration:

```env
VITE_API_BASE_URL=http://localhost:3001/api
VITE_WEB_ORIGIN=http://localhost:8081
```

### 3. Database Setup

```bash
cd backend

# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate
```

### 4. Demo Users Setup

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

Run the seed script to create these users:
```bash
npm run db:seed
```

### 5. Start the Application

#### Backend
```bash
cd backend
npm run dev
```

The backend will start on `http://localhost:3001`

#### Frontend
```bash
# In a new terminal
npm run dev
```

The frontend will start on `http://localhost:8081`

## API Endpoints

### Authentication Endpoints

#### Email/Password Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Token refresh
- `POST /api/auth/logout` - Single session logout
- `POST /api/auth/logout-all` - Revoke all user sessions
- `GET /api/auth/me` - Get current user info



#### Protected Endpoints
- `GET /api/users` - Example protected route

### Request/Response Examples

#### Register User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123",
  "name": "John Doe"
}
```

#### Login User
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

#### Get User Profile
```bash
GET /api/auth/me
# Requires authentication cookies
```

## Frontend Usage

### Authentication Context

```tsx
import { useAuth } from '@/context/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, login, register, logout, initiateGoogleAuth } = useAuth();

  const handleLogin = async () => {
    try {
      await login({ email: 'user@example.com', password: 'password' });
      // User is now logged in
    } catch (error) {
      console.error('Login failed:', error);
    }
  };



  return (
    <div>
      {isAuthenticated ? (
        <p>Welcome, {user?.name}!</p>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
}
```

### Protected Routes

```tsx
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
```

## Security Features

### Cookie Security
- **httpOnly**: Prevents XSS attacks
- **Secure**: Only sent over HTTPS in production
- **SameSite=strict**: Prevents CSRF attacks
- **Domain**: Configurable for production

### Token Security
- **Access Tokens**: 15-minute expiration
- **Refresh Tokens**: 30-day expiration with rotation
- **Token Storage**: SHA-256 hashed in database
- **Token Revocation**: Support for forced logout



## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT, -- NULL for SSO-only users
  name TEXT,
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



## Development

### Running Tests
```bash
cd backend
npm test
```

### Database Management
```bash
cd backend

# Open Prisma Studio
npm run db:studio

# Reset database
npm run db:migrate:reset

# Seed database
npm run db:seed
```

### Logging
The application uses Pino for structured logging:
- **Development**: Pretty-printed logs
- **Production**: JSON structured logs

## Production Deployment

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

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure `VITE_WEB_ORIGIN` matches your frontend URL

3. **Database Connection**: Check PostgreSQL is running and credentials are correct
4. **Cookie Issues**: Ensure domain and secure settings match your environment

### Debug Mode
Set `NODE_ENV=development` for detailed error messages and logging.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
