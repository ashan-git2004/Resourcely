# Quick Start Guide

Get Smart Campus running in 5 minutes.

## Prerequisites
- Node.js 16+ (frontend)
- Java 17+ (backend)
- Maven 3.8+ (backend build)
- MongoDB (local or cloud)
- Google OAuth2 credentials

## 1. Backend Setup

### Clone/Navigate
```bash
cd backend
```

### Create .env file
```bash
cat > .env << 'EOF'
MONGO_URI=mongodb://localhost:27017/smart-campus
JWT_SECRET=this-is-a-very-secret-key-for-jwt-minimum-32-bytes-long!
JWT_EXPIRATION_MS=3600000
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
OAUTH2_REDIRECT_URI=http://localhost:5173/oauth2/redirect
BOOTSTRAP_ADMIN_ENABLED=true
BOOTSTRAP_ADMIN_EMAIL=admin@campus.edu
BOOTSTRAP_ADMIN_PASSWORD=admin123456
EOF
```

### Build & Run
```bash
mvn clean install
mvn spring-boot:run
```

✅ Backend ready: `http://localhost:8080`

## 2. Frontend Setup

### Navigate & Install
```bash
cd frontend
npm install
```

### Create .env.local (if needed)
```bash
echo "VITE_API_BASE_URL=http://localhost:8080" > .env.local
```

### Run Development Server
```bash
npm run dev
```

✅ Frontend ready: `http://localhost:5173`

## 3. First Test

1. **Register:**
   - Go to `http://localhost:5173/register`
   - Enter: `test@campus.edu` / `test123456`
   - Click "Create Account"

2. **Admin Approve:**
   - Go to `http://localhost:5173/login`
   - Enter: `admin@campus.edu` / `admin123456` (bootstrap creds)
   - Click "Admin" → Approve `test@campus.edu` as "User"

3. **Login:**
   - Go to `http://localhost:5173/login`
   - Enter: `test@campus.edu` / `test123456`
   - ✅ Dashboard shows!

## 4. Google OAuth2 Setup (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project
3. Enable Google+ API
4. Create OAuth 2.0 Web Application credentials
5. Add redirect URIs:
   - `http://localhost:8080/login/oauth2/code/google`
   - `http://localhost:5173/oauth2/redirect`
6. Copy Client ID & Secret to `.env` file

Then test Google sign-up!

## Common Issues

### MongoDB Connection Failed
```bash
# Make sure MongoDB is running:
# Local: mongod
# Or update MONGO_URI to cloud instance
```

### Port 8080 Already in Use
```bash
# Kill existing process or change port in application.properties:
server.port=8081
```

### Node Modules Issues
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Google OAuth Not Working
- Double-check credentials in .env
- Verify redirect URIs exactly match Google Console
- Clear browser cookies/cache

## What's Included?

✅ Credentials registration & login
✅ Google OAuth2 integration
✅ JWT authentication
✅ Role-based access control (USER, TECHNICIAN, MANAGER, ADMIN)
✅ Admin approval workflow
✅ Email matching for cross-auth
✅ Protected routes (frontend & backend)
✅ Role-specific dashboards
✅ Responsive UI

## Database Structure

### Users Collection
```json
{
  "_id": "ObjectId",
  "email": "user@campus.edu",
  "password": "bcrypt-hash-or-null",
  "provider": "LOCAL" or "GOOGLE",
  "roles": ["USER", "ADMIN"],
  "approvalStatus": "PENDING", "ACTIVE", or "REJECTED",
  "enabled": true,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

## Next Steps

1. **Review the guides:**
   - `AUTHENTICATION_GUIDE.md` - Detailed auth architecture
   - `TESTING_SCENARIOS.md` - All test flows explained
   - `API_TESTING.md` - API endpoint reference

2. **Customize:**
   - Update role descriptions in dashboards
   - Add more dashboard features
   - Implement token refresh endpoint
   - Add more OAuth2 providers

3. **Deploy:**
   - Set production environment variables
   - Use proper JWT secret (not example)
   - Restrict CORS to production domain
   - Use HTTPS everywhere
   - Add rate limiting

## Quick Reference

| Service | URL | Port |
|---------|-----|------|
| Frontend | http://localhost:5173 | 5173 |
| Backend | http://localhost:8080 | 8080 |
| MongoDB | mongodb://localhost:27017 | 27017 |
| Admin | admin@campus.edu | pass in .env |

---

**Ready to go! 🚀**

Questions? Check the documentation files in the root directory.
