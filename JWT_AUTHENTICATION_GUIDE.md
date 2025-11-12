# JWT Authentication System - Implementation Guide

## Overview

Your application now uses a secure JWT (JSON Web Token) authentication system with HTTP-only cookies. The tokens contain user information including role and permissions, making them suitable for both access control and user identification.

## Architecture

### Components

1. **Backend JWT Manager** (`backend/lib/jwtManager.js`)
   - Creates and validates JWT tokens
   - Uses HMAC-SHA256 for signing
   - Configurable expiry times

2. **Backend Auth Service** (`backend/lib/authService.js`)
   - Handles Firebase Admin integration
   - User authentication and registration
   - Token generation with user metadata
   - Role and permission management

3. **Frontend Auth Service** (`src/lib/authService.ts`)
   - Cookie-based token management
   - Login/registration requests
   - Token refresh logic
   - User profile management

4. **Auth Context** (`src/contexts/AuthContext.tsx`)
   - React context for auth state
   - User authentication status tracking
   - Automatic token refresh
   - Protected route handling

### API Endpoints

All endpoints are located in `pages/api/auth/`:

- **POST /api/auth/login** - Authenticate user and receive JWT token in cookie
- **POST /api/auth/register** - Create new user and receive JWT token in cookie
- **POST /api/auth/refresh** - Refresh expired JWT token
- **GET /api/auth/me** - Get current user profile
- **POST /api/auth/logout** - Clear auth cookie
- **PUT /api/users/profile** - Update user profile

## Token Structure

### JWT Payload (Access Token)

```json
{
  "userId": "firebase-uid",
  "email": "user@example.com",
  "displayName": "User Name",
  "photoURL": "https://...",
  "role": "user|content_manager|community_manager|user_support|super_admin",
  "permissions": ["permission1", "permission2"],
  "iat": 1234567890,
  "exp": 1234571490
}
```

- **iat**: Issued At (Unix timestamp)
- **exp**: Expiration (Unix timestamp)
- **Default expiry**: 1 hour (configurable via `JWT_EXPIRES_IN`)

### Token Storage

Tokens are stored in **HTTP-only cookies** with the following attributes:
- **HttpOnly**: Prevents JavaScript access (security)
- **Secure**: Only sent over HTTPS in production
- **SameSite=Strict**: CSRF protection
- **Max-Age**: Set to token expiry duration

## Environment Variables

Add these to your `.env.local` or environment configuration:

```env
# JWT Configuration
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=3600
JWT_REFRESH_EXPIRES_IN=604800

# Firebase Configuration
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
FIREBASE_PROJECT_ID=your-project-id
```

## Usage Examples

### Frontend - Login

```typescript
import { useAuth } from '@/contexts/AuthContext';

export function LoginPage() {
  const { signIn, error } = useAuth();

  const handleLogin = async (email: string, password: string) => {
    try {
      await signIn({ email, password });
      // User is automatically set in context and cookie is stored
      // Redirect to dashboard
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleLogin(email, password);
    }}>
      {/* Form fields */}
    </form>
  );
}
```

### Frontend - Check Authentication

```typescript
import { useAuth } from '@/contexts/AuthContext';

export function ProtectedComponent() {
  const { user, isAuthenticated, isAdmin } = useAuth();

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return (
    <div>
      Welcome {user?.full_name}!
      {isAdmin && <p>Admin Panel</p>}
    </div>
  );
}
```

### Frontend - Logout

```typescript
const { signOut } = useAuth();

const handleLogout = async () => {
  await signOut();
  // Cookie is cleared, user state is reset
};
```

### Frontend - Authenticated Requests

```typescript
import { authenticatedRequest } from '@/lib/authService';

const fetchUserData = async () => {
  try {
    const response = await authenticatedRequest('/api/users/data');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch:', error);
  }
};
```

## Security Features

### 1. HTTP-Only Cookies
- Tokens cannot be accessed via JavaScript
- Protected against XSS attacks

### 2. CSRF Protection
- SameSite=Strict cookie attribute
- Prevents cross-site requests

### 3. Token Expiry
- Short-lived access tokens (1 hour default)
- Automatic refresh before expiry
- Expired tokens are rejected

### 4. Rate Limiting
- Login endpoint implements rate limiting
- Max 5 attempts per email
- 15-minute lockout after max attempts

### 5. Validation
- Email format validation
- Password strength validation (6+ characters)
- Token signature verification

## Token Refresh Flow

### Automatic Refresh
The system automatically refreshes tokens when:
- Token is within 5 minutes of expiry
- User makes an API request with expired token
- Token refresh is manually triggered

### Refresh Process
1. Client detects token nearing expiry
2. Sends refresh request to `/api/auth/refresh`
3. Server verifies token and generates new token
4. New token is set in HTTP-only cookie
5. Client continues with fresh token

## Role-Based Access Control

### Available Roles
- `user` - Regular user (default)
- `content_manager` - Can manage content
- `community_manager` - Can manage community
- `user_support` - Support team member
- `super_admin` - Full administrative access

### Usage
```typescript
const { user, isAdmin, isSuperAdmin } = useAuth();

if (isAdmin) {
  // Show admin features
}

if (user?.role === 'super_admin') {
  // Show super admin features
}

if (user?.permissions.includes('manage_content')) {
  // Show content management features
}
```

## Error Handling

### Authentication Errors

```typescript
const { signIn, error } = useAuth();

const errors = {
  'INVALID_CREDENTIALS': 'Invalid email or password',
  'EMAIL_EXISTS': 'Email already registered',
  'RATE_LIMITED': 'Too many login attempts',
  'SESSION_EXPIRED': 'Session expired, please login again',
  'UNAUTHORIZED': 'Authentication required'
};
```

## Firestore Schema

User documents are stored in Firestore collection `users`:

```json
{
  "uid": "firebase-uid",
  "email": "user@example.com",
  "displayName": "User Name",
  "photoURL": "https://...",
  "role": "user",
  "permissions": [],
  "onboarding_completed": false,
  "education_level": "bachelors",
  "job_title": "Developer",
  "industry": "Tech",
  "experience_level": "3-5 years",
  "business_stage": "growth",
  "country": "USA",
  "state_province": "CA",
  "city": "San Francisco",
  "created_at": timestamp,
  "updated_at": timestamp
}
```

## Migration from Old Auth System

If migrating from the previous auth system:

1. **Update Components**: Replace Firebase SDK usage with `useAuth()` hook
2. **Update Services**: Use `authService` instead of direct Firebase calls
3. **Clear Old Data**: Remove localStorage keys from old auth system
4. **Test Flow**: Verify login, logout, and token refresh work correctly

## Troubleshooting

### Token Not Being Set
- Check `FIREBASE_SERVICE_ACCOUNT_KEY` environment variable
- Verify Firebase Admin SDK is initialized
- Check browser console for errors

### "Token verification failed" Error
- Verify `JWT_SECRET` is consistent across requests
- Check token hasn't been tampered with
- Ensure server clock is synchronized

### Session Keeps Expiring
- Check `JWT_EXPIRES_IN` configuration
- Verify refresh endpoint is working
- Check browser cookie settings aren't blocking cookies

### CORS Issues
- Add proper CORS headers in API responses
- Ensure `credentials: 'include'` in fetch requests
- Check cookie SameSite policy

## Performance Considerations

### Token Refresh Strategy
- Tokens are refreshed proactively 5 minutes before expiry
- Reduces interruptions from expired tokens
- Client-side token status checking prevents unnecessary requests

### Cookie Size
- JWT tokens are typically 500-1000 bytes
- Well within HTTP cookie size limits (4KB typically)
- No performance impact from token storage

## Production Checklist

- [ ] Set `JWT_SECRET` to a strong, random value
- [ ] Set `NODE_ENV=production`
- [ ] Enable HTTPS for all requests
- [ ] Set secure environment variables (not in .env files)
- [ ] Test token refresh flow
- [ ] Verify logout clears cookies properly
- [ ] Test rate limiting on login endpoint
- [ ] Monitor failed login attempts
- [ ] Set up error logging/monitoring
- [ ] Test on multiple browsers and devices

## Additional Resources

- JWT.io - JWT introduction and debugger
- Firebase Documentation - https://firebase.google.com/docs
- OWASP - Authentication best practices
- Cookie Security - MDN Web Docs

## Support

For issues or questions:
1. Check error messages in browser console
2. Review the troubleshooting section above
3. Check Firestore permissions and Firebase configuration
4. Verify all environment variables are set correctly
