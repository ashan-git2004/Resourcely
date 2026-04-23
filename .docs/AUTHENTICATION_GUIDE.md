# Smart Campus Authentication & Authorization Guide

## Overview

This guide documents the complete OAuth 2.0, JWT, and Role-Based Access Control (RBAC) implementation for the Smart Campus application.

## Architecture

### Authentication Systems
- **Credentials-based:** Email + password registration and login
- **OAuth 2.0 (Google):** Single sign-on via Google account
- **JWT Tokens:** Stateless session management with role embedding

### User Roles
1. **USER (Student)** - Access campus facilities, schedules, and services
2. **TECHNICIAN** - Manage campus infrastructure and maintenance
3. **MANAGER** - Oversee operations, analytics, and resource allocation
4. **ADMIN** - Full system access, user management, and approvals

## Key Features

### 1. User Registration & Approval Workflow
```
Register (Credentials/Google) → PENDING Status → Admin Reviews → Assign Role → ACTIVE Status → Access Granted
```

### 2. Email Matching for Cross-Registration
Users can register with one method and login with another if emails match:
- Registered with credentials → Can later login with Google
- Registered with Google → Can later login with credentials (if password added)

### 3. Role-Based Access Control (Frontend & Backend)
- **Frontend:** Protected routes check user roles before rendering
- **Backend:** Spring Security endpoints protected by `@PreAuthorize("hasRole(...)")`

## Setup Instructions

### Backend Configuration

1. **Environment Variables** (.env file):
```env
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>/<database>?retryWrites=true&w=majority
JWT_SECRET=your-very-long-random-secret-key (min 32 bytes)
JWT_EXPIRATION_MS=3600000
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
OAUTH2_REDIRECT_URI=http://localhost:5173/oauth2/redirect
BOOTSTRAP_ADMIN_ENABLED=true
BOOTSTRAP_ADMIN_EMAIL=admin@campus.edu
BOOTSTRAP_ADMIN_PASSWORD=secure-password
```

2. **Google OAuth2 Setup:**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project
   - Enable Google+ API
   - Create OAuth 2.0 credentials (Web Application)
   - Add authorized redirect URIs:
     - `http://localhost:8080/login/oauth2/code/google`
     - `http://localhost:5173/oauth2/redirect`

3. **Database:**
   - MongoDB must be running and accessible via MONGO_URI

4. **Build & Run:**
```bash
cd backend
mvn clean install
mvn spring-boot:run
```

Server runs on `http://localhost:8080`

### Frontend Configuration

1. **Environment Variables** (.env.local):
```env
VITE_API_BASE_URL=http://localhost:8080
```

2. **Install Dependencies:**
```bash
cd frontend
npm install
```

3. **Run Development Server:**
```bash
npm run dev
```

Frontend runs on `http://localhost:5173`

## Testing Authentication Flows

### Flow 1: Credentials Registration & Login
1. Go to `http://localhost:5173/register`
2. Enter email and password
3. Click "Create Account"
4. Open admin panel (login with bootstrap admin)
5. Approve user with "USER" role
6. User can now login with credentials

### Flow 2: Google Sign-Up & Login
1. Go to `http://localhost:5173/register`
2. Click "Sign Up with Google"
3. Authenticate with Google account
4. Account created with PENDING status
5. Admin approves user
6. User can login again with Google

### Flow 3: Cross-Registration (Credentials + Google)
1. User registers with credentials (email: user@example.com)
2. Admin approves with role
3. User logs out
4. User clicks "Continue with Google" and signs in with same email
5. System recognizes the email matches existing account
6. User granted access based on assigned role

### Flow 4: Cross-Registration (Google + Credentials)
1. User registers with Google
2. Admin approves with role
3. User logs out
4. User tries credentials login with same email (not possible without password)
5. Error message guides them to use Google

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register with credentials
- `POST /api/auth/login` - Login with credentials
- `GET /oauth2/authorization/google` - Initiate Google OAuth2
- `GET /oauth2/redirect` - OAuth2 redirect callback

### Admin Operations (ADMIN role required)
- `GET /api/admin/users/pending` - List pending users
- `PATCH /api/admin/users/{id}/approve` - Approve user with role
- `PATCH /api/admin/users/{id}/reject` - Reject user

### User Profile
- `GET /api/user/me` - Get current user profile

## Frontend Routes

### Public Routes
- `/login` - User login
- `/register` - User registration
- `/oauth2/redirect` - OAuth2 callback handler

### Protected Routes (Authenticated)
- `/dashboard` - Main dashboard (shows based on role)
- `/dashboard/technician` - Technician dashboard (TECHNICIAN role)
- `/dashboard/manager` - Manager dashboard (MANAGER role)
- `/dashboard/student` - Student dashboard (USER role)
- `/admin/users` - Admin panel (ADMIN role)

## Role-Based Dashboard Routing

The system automatically redirects authenticated users to appropriate dashboards:
- **ADMIN** → `/admin/users` (user approval panel)
- **MANAGER** → `/dashboard/manager` (operations overview)
- **TECHNICIAN** → `/dashboard/technician` (infrastructure management)
- **USER** → `/dashboard` (default user dashboard)

Users pending approval see a special "Pending Approval" page.

## Backend Security Configuration

### CORS
- Allowed origins: `http://localhost:5173` (configure in `SecurityConfig.java`)
- Allowed methods: GET, POST, PUT, DELETE, PATCH, OPTIONS

### RBAC Decoration
```java
@PreAuthorize("hasRole('ADMIN')")
public ResponseEntity<List<AdminUserResponse>> getPendingUsers() { ... }

@PreAuthorize("hasAnyRole('USER', 'ADMIN', 'TECHNICIAN', 'MANAGER')")
public ResponseEntity<UserResponse> getCurrentUser() { ... }
```

## JWT Token Structure

```json
{
  "sub": "user@email.com",
  "roles": ["USER", "ADMIN"],
  "iat": 1234567890,
  "exp": 1234571490
}
```

Frontend decodes JWT on login to extract roles for UI decisions.

## Troubleshooting

### Google Login Not Working
- Check GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are correct
- Verify redirect URIs in Google Cloud Console match exactly
- Clear browser cookies and try again

### Token Expiration
- Token expires after duration set in JWT_EXPIRATION_MS
- Frontend automatically captures new token on each login
- For long sessions, implement token refresh endpoint

### Pending Approval Shows Forever
- Admin must explicitly approve users with a role
- Check `/api/admin/users/pending` to see unapproved users
- Verify admin account has ADMIN role and ACTIVE status

### Role Not Applied After Approval
- Clear browser localStorage (stores auth data)
- Logout and login again
- Check token content: open DevTools, look at localStorage `smart-campus-auth`

## Email Collision Handling

If user registers with both credentials and Google using same email:
1. First account (credentials) is created
2. Second account (Google) checks email existence
3. Uses existing account instead of creating new
4. Both auth methods access the same account

This prevents duplicate accounts for same email address.

## Production Considerations

1. **Environment Variables:** Use environment-specific .env files
2. **JWT Secret:** Generate long random string using `SecureRandom` or `openssl rand -base64 32`
3. **MongoDB:** Use proper connection pooling and SSL/TLS
4. **CORS:** Restrict to specific production domains
5. **HTTPS:** Enforce HTTPS in production
6. **Token Refresh:** Implement refresh token endpoint for extended sessions
7. **Rate Limiting:** Add rate limiting to login/registration endpoints

## Development Notes

- Backend: Spring Boot 3.3.5, Java 17
- Frontend: React 18, React Router 6
- Database: MongoDB
- Authentication: Spring Security + OAuth2
- JWT: JJWT library (v0.12.6)

---

**Last Updated:** March 2026
