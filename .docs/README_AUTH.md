# Smart Campus - Authentication & Authorization System

Complete OAuth 2.0 and role-based access control implementation for the Smart Campus application.

## 🎯 What's Implemented

✅ **OAuth 2.0 (Google Sign-In)**
✅ **Credentials-based Authentication** (Email/Password)
✅ **Cross-Authentication Support** (Use both methods with same email)
✅ **Role-Based Access Control** (USER, TECHNICIAN, MANAGER, ADMIN)
✅ **Admin Approval Workflow** (Admins grant permissions)
✅ **JWT Tokens** (Secure, stateless sessions)
✅ **Protected Routes** (Frontend & Backend)
✅ **Role-Specific Dashboards** (Different UI per role)
✅ **Complete Documentation** (Setup, API, testing guides)

---

## 🚀 Quick Start (5 Minutes)

```bash
# Backend
cd backend
mvn clean install && mvn spring-boot:run

# Frontend (new terminal)
cd frontend
npm install && npm run dev
```

Then visit `http://localhost:5173`

**Full quick start guide:** [`QUICK_START.md`](./QUICK_START.md)

---

## 📖 Documentation

| Document | Purpose |
|----------|---------|
| [**QUICK_START.md**](./QUICK_START.md) | Get running in 5 minutes |
| [**AUTHENTICATION_GUIDE.md**](./AUTHENTICATION_GUIDE.md) | Complete architecture & detailed setup |
| [**TESTING_SCENARIOS.md**](./TESTING_SCENARIOS.md) | 10 step-by-step test scenarios |
| [**API_TESTING.md**](./API_TESTING.md) | API endpoints & curl examples |
| [**IMPLEMENTATION_SUMMARY.md**](./IMPLEMENTATION_SUMMARY.md) | What was built & modified |

**Start here:** Choose based on what you need to do
- **New to project?** → Start with [QUICK_START.md](./QUICK_START.md)
- **Want to understand how it works?** → Read [AUTHENTICATION_GUIDE.md](./AUTHENTICATION_GUIDE.md)
- **Need to test?** → Follow [TESTING_SCENARIOS.md](./TESTING_SCENARIOS.md)
- **Testing APIs?** → Check [API_TESTING.md](./API_TESTING.md)
- **Want the summary?** → See [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)

---

## 🔑 Key Features Explained

### User Registration & Login

**Two Registration Options:**
1. Email + Password (LOCAL)
2. Google Account (OAUTH2)

**Two Login Options:**
1. Email + Password
2. Google Sign-In

**Cross-Registration Support:**
- Register with credentials, later login with Google (same email)
- Register with Google, later login with credentials
- System prevents duplicate accounts for same email

### Admin Approval Workflow

```
User Registers 
    ↓
User Status: PENDING
    ↓
Admin Reviews Account
    ↓
Admin Assigns Role (USER, TECHNICIAN, MANAGER, ADMIN)
    ↓
User Status: ACTIVE
    ↓
User Can Now Login & Access Role-Based Resources
```

### Role-Based Access

| Role | Access |
|------|--------|
| **USER** (Student) | View facilities, report issues, access schedules |
| **TECHNICIAN** | Manage infrastructure, handle maintenance |
| **MANAGER** | View analytics, manage resources, oversee ops |
| **ADMIN** | Full access, user approvals, system management |

### Automatic Dashboard Routing

- Users with **ADMIN** role → Admin approval panel
- Users with **MANAGER** role → Manager dashboard
- Users with **TECHNICIAN** role → Technician dashboard
- Users with **USER** role → General user dashboard

---

## 🛠️ Setup Requirements

### Prerequisites
- Node.js 16+ (for frontend)
- Java 17+ (for backend)
- Maven 3.8+ (for building backend)
- MongoDB (local or cloud)
- Google OAuth2 credentials (optional, but recommended)

### Configuration Files

**Backend (.env file):**
```env
MONGO_URI=mongodb://localhost:27017/smart-campus
JWT_SECRET=your-secret-key-at-least-32-bytes
JWT_EXPIRATION_MS=3600000
GOOGLE_CLIENT_ID=from-google-cloud-console
GOOGLE_CLIENT_SECRET=from-google-cloud-console
OAUTH2_REDIRECT_URI=http://localhost:5173/oauth2/redirect
BOOTSTRAP_ADMIN_ENABLED=true
BOOTSTRAP_ADMIN_EMAIL=admin@campus.edu
BOOTSTRAP_ADMIN_PASSWORD=admin123456
```

**Frontend (.env.local file):**
```env
VITE_API_BASE_URL=http://localhost:8080
```

---

## 🔐 Security Features

- ✅ BCrypt password encryption
- ✅ JWT token signing (HS256)
- ✅ CORS configuration
- ✅ Role-based authorization
- ✅ Account approval enforcement
- ✅ Email validation & normalization
- ✅ Account disable flag
- ✅ OAuth2 error handling

---

## 📋 Project Structure

```
smart-campus/
├── backend/
│   └── src/main/java/com/smartcampus/
│       ├── controller/          # REST endpoints
│       ├── service/             # Business logic
│       ├── model/               # Data models
│       ├── repository/          # Database access
│       ├── security/            # JWT & OAuth2
│       ├── config/              # Spring configuration
│       ├── dto/                 # Data transfer objects
│       └── exception/           # Error handling
├── frontend/
│   └── src/
│       ├── components/          # React components
│       ├── features/            # Feature modules
│       ├── routes/              # Route definitions
│       ├── context/             # Auth context
│       └── styles.css           # Global styling
├── QUICK_START.md               # 5-minute setup
├── AUTHENTICATION_GUIDE.md      # Architecture guide
├── TESTING_SCENARIOS.md         # Test procedures
├── API_TESTING.md               # API reference
└── IMPLEMENTATION_SUMMARY.md    # What was built
```

---

## 🧪 Testing

### Quick Test
1. Register: `test@campus.edu` / `password123`
2. Admin login: `admin@campus.edu` / `admin123456`
3. Approve user as "User" role
4. Login as test user
5. See dashboard with role info

### Complete Testing
- See [TESTING_SCENARIOS.md](./TESTING_SCENARIOS.md) for 10 detailed scenarios
- Includes credentials, Google, cross-auth, role-based routing tests

### API Testing
- See [API_TESTING.md](./API_TESTING.md) for exact endpoints
- Includes curl examples and Postman setup

---

## 🚨 Common Issues & Solutions

### Issue: Google Login Not Working
**Solution:** Verify Google credentials in .env and authorized redirect URIs

### Issue: User Can't Login After Registration
**Solution:** Admin must approve user first. Check admin approval panel.

### Issue: Port Already in Use
**Solution:** Kill existing process or change port in application.properties

### Issue: "This account is registered with Google" Error
**Solution:** User registered with Google. Use Google sign-in instead.

**More help:** See [AUTHENTICATION_GUIDE.md](./AUTHENTICATION_GUIDE.md#troubleshooting)

---

## 📊 Database

### Collections
- **users** - User accounts with roles, approval status, auth provider

### Fields
- email (unique, indexed)
- passwordHash (nullable for OAuth2)
- roles (set of enum values)
- approvalStatus (PENDING, ACTIVE, REJECTED)
- authProvider (LOCAL, GOOGLE)
- enabled (boolean)
- createdAt, updatedAt (timestamps)

---

## 🔗 API Endpoints Summary

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/api/auth/register` | POST | None | Register user |
| `/api/auth/login` | POST | None | Login with credentials |
| `/oauth2/authorization/google` | GET | None | Google OAuth2 |
| `/api/admin/users/pending` | GET | ADMIN | List pending users |
| `/api/admin/users/{id}/approve` | PATCH | ADMIN | Approve user |
| `/api/admin/users/{id}/reject` | PATCH | ADMIN | Reject user |
| `/api/user/me` | GET | User | Get current user |

**Full API reference:** [API_TESTING.md](./API_TESTING.md)

---

## 🎯 Next Steps

1. **Setup:** Follow [QUICK_START.md](./QUICK_START.md)
2. **Test:** Navigate to [TESTING_SCENARIOS.md](./TESTING_SCENARIOS.md)
3. **Customize:** Modify dashboards, add business logic
4. **Deploy:** Configure production environment variables
5. **Monitor:** Set up logging and error tracking

---

## 💡 Key Implementation Details

### Email Matching for Cross-Auth
When user tries to login with different auth provider but same email:
1. System finds existing user by email
2. Checks if previously approved
3. Allows login if approved, regardless of provider
4. Prevents duplicate accounts for same email

### Role Assignment
Admin assigns roles individually:
- USER → Basic campus access
- TECHNICIAN → Infrastructure management
- MANAGER → Operations oversight
- ADMIN → Full system access

(Future: Support multiple roles per user with UI update)

### Pending Account State
Accounts created but not approved show:
- **Frontend:** "Account Pending Approval" message
- **Backend:** Returns 400 error on login attempt
- Guides users to wait for admin approval

---

## 📝 File Modifications

### Backend Changes
- `OAuth2SuccessHandler.java` - Improved error handling
- `AuthService.java` - Cross-auth support
- `UserController.java` - NEW: User profile endpoint

### Frontend Changes
- `LoginPage.jsx` - Enhanced UX
- `RegisterPage.jsx` - Better messaging
- `DashboardPage.jsx` - Multiple roles support
- `AppRouter.jsx` - Role-based routing
- `AdminUsersPage.jsx` - Improved admin panel
- `TechnicianDashboard.jsx` - NEW: Technician interface
- `ManagerDashboard.jsx` - NEW: Manager interface
- `StudentDashboard.jsx` - NEW: Student interface

---

## ✅ Verification Checklist

- [ ] Backend runs without errors
- [ ] Frontend runs without errors
- [ ] Can register with credentials
- [ ] Can register with Google
- [ ] Admin can approve/reject users
- [ ] Approved user can login
- [ ] Roles correctly assigned
- [ ] Dashboard routing works per role
- [ ] Protected routes block unauthorized access
- [ ] Cross-auth works with same email

---

## 📞 Support

- **Setup Issues?** → [QUICK_START.md](./QUICK_START.md)
- **Architecture Questions?** → [AUTHENTICATION_GUIDE.md](./AUTHENTICATION_GUIDE.md)
- **Testing Help?** → [TESTING_SCENARIOS.md](./TESTING_SCENARIOS.md)
- **API Issues?** → [API_TESTING.md](./API_TESTING.md)
- **What Changed?** → [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)

---

**Ready to go! Start with [QUICK_START.md](./QUICK_START.md) 🚀**
