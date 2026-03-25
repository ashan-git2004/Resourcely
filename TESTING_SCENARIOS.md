# Complete Testing Scenarios

Follow these step-by-step scenarios to test all authentication flows mentioned in the requirements.

## Setup Prerequisites

1. Backend running on `http://localhost:8080`
2. Frontend running on `http://localhost:5173`
3. MongoDB connected and accessible
4. Google OAuth2 credentials configured
5. Bootstrap admin account created (check .env BOOTSTRAP_ADMIN_ENABLED=true)

---

## Scenario 1: User Registers with Credentials & Logs In with Credentials

**User: student1@campus.edu**

### Steps:
1. Open `http://localhost:5173/register`
2. Click **"Create Account"**
3. Fill form:
   - Email: `student1@campus.edu`
   - Password: `Password123`
   - Confirm: `Password123`
4. Click **"Create Account"**
5. See success message: "Account created successfully!"
6. Redirected to login page

### Admin Approval:
1. Open different browser/incognito: `http://localhost:5173/login`
2. Login as admin with bootstrap creds (check .env)
3. Click **"Admin"** in navbar → "Pending User Approvals"
4. See `student1@campus.edu` (Provider: LOCAL)
5. Select role: **"User (Student)"**
6. Click **"Approve"**
7. See success message

### User Login:
1. Open `http://localhost:5173/login`
2. Enter credentials:
   - Email: `student1@campus.edu`
   - Password: `Password123`
3. Click **"Sign In"**
4. ✅ Redirected to dashboard showing:
   - Email: student1@campus.edu
   - Provider: LOCAL
   - Role: USER
   - Permissions listed

---

## Scenario 2: User Registers with Google & Logs In with Google

**User: your-google-email@gmail.com**

### Steps:
1. Open `http://localhost:5173/register`
2. Click **"Sign Up with Google"**
3. Authenticate with Google account
4. See success message: "Account created successfully!"
5. Redirected to login page

### Admin Approval:
1. Login as admin (different browser)
2. Go to Admin panel
3. See your-google-email@gmail.com (Provider: GOOGLE)
4. Select role: **"Technician"** (or any role)
5. Click **"Approve"**

### User Login:
1. Open login page in new browser
2. Click **"Continue with Google"**
3. Authenticate with same Google account
4. ✅ Redirected to technician dashboard:
   - Shows "Technician Dashboard"
   - Lists technician-specific actions

---

## Scenario 3: Credentials Registration + Google Login (Same Email)

**User: hybrid1@campus.edu & Google: hybrid1@campus.edu**

### Steps:
1. **Register with Credentials:**
   - Go to `http://localhost:5173/register`
   - Create account: `hybrid1@campus.edu` / `Password123`
   - Success message shown

2. **Admin Approves:**
   - Login as admin
   - Find `hybrid1@campus.edu` (LOCAL)
   - Approve with role: **"Manager"**

3. **First Login (Credentials):**
   - Go to login
   - Enter credentials
   - ✅ Logged in successfully

4. **Logout:**
   - Click "Logout" button in navbar

5. **Second Login (Google with Same Email):**
   - Go to login
   - Click "Continue with Google"
   - Authenticate with Google account: `hybrid1@campus.edu`
   - ✅ **System recognizes same email!**
   - ✅ Redirected to dashboard with same role (Manager)
   - Shows "Manager Dashboard"

✅ **Result:** Both auth methods access the same account with same role

---

## Scenario 4: Google Registration + Credentials Login Attempt

**User: google-only@gmail.com**

### Steps:
1. **Register with Google:**
   - Go to `http://localhost:5173/register`
   - Click "Sign Up with Google"
   - Authenticate with Google: `google-only@gmail.com`
   - Account created

2. **Admin Approves:**
   - Login as admin
   - Find `google-only@gmail.com` (GOOGLE)
   - Approve with role: **"User"**

3. **Try Credentials Login:**
   - Go to `http://localhost:5173/login`
   - Try credentials: `google-only@gmail.com` / any password
   - ❌ Error shown: **"This account is registered with Google. Use Google sign-in to continue."**

4. **Correct Login (Google):**
   - Click "Continue with Google"
   - ✅ Login successful

✅ **Result:** System blocks credentials attempt, guides to Google

---

## Scenario 5: Pending Approval Display (User Cannot Access Dashboard)

**User: pending@campus.edu**

### Steps:
1. **Register:**
   - Register with credentials: `pending@campus.edu`
   - Success message shown

2. **Attempt Login (Should Fail):**
   - Go to login
   - Enter `pending@campus.edu` / `Password123`
   - ❌ Error shown: **"Account pending admin approval. Please wait for admin to grant you access."**

3. **After Admin Approval:**
   - Admin approves with any role
   - Now credentials login works
   - ✅ Dashboard accessible

✅ **Result:** Unapproved users cannot login

---

## Scenario 6: Role-Based Dashboard Routing

Test with different roles to see automatic routing.

### Admin User:
1. Create & approve user with **ADMIN** role
2. Login as admin
3. Automatically redirected to `/admin/users` (Admin Panel)
4. See pending approvals

### Manager User:
1. Create & approve user with **MANAGER** role
2. Login as manager
3. Automatically redirected to `/dashboard/manager` (Manager Dashboard)
4. See manager-specific content

### Technician User:
1. Create & approve user with **TECHNICIAN** role
2. Login as technician
3. Automatically redirected to `/dashboard/technician` (Technician Dashboard)
4. See technician-specific actions

### Regular User:
1. Create & approve user with **USER** role
2. Login as user
3. Redirected to `/dashboard` (General user dashboard)
4. Can navigate to `/dashboard/student` for student view

✅ **Result:** Each role sees appropriate dashboard

---

## Scenario 7: Protected Routes (Unauthorized Access)

### Steps:
1. **Without Login:**
   - Try accessing `http://localhost:5173/admin/users`
   - ❌ Redirected to `/login`

2. **Logged In as Non-Admin:**
   - Login as USER role
   - Try accessing `http://localhost:5173/admin/users`
   - ❌ Redirected to `/dashboard`

3. **Logged In as Admin:**
   - Login as ADMIN role
   - Navigate to `http://localhost:5173/admin/users`
   - ✅ Admin panel loads successfully

✅ **Result:** Routes properly protected by role

---

## Scenario 8: Cross-Browser Session Management

**Verify localStorage-based session persists**

### Steps:
1. Register and login user
2. **Browser Tab 1:** Open dashboard in one tab
3. **Browser Tab 2:** Open same dashboard in another tab
   - ✅ Both tabs show same user/roles
   - ✅ Logout in Tab 1, Tab 2 refreshes and clears
   - ✅ Session properly synchronized

✅ **Result:** Authentication state persists across tabs/refreshes

---

## Scenario 9: Token Expiration

**Verify JWT token expiration handling**

### Steps:
1. Login successfully
2. Extract token from browser ConsoleDevTools:
   ```javascript
   JSON.parse(localStorage.getItem('smart-campus-auth')).token
   ```
3. Paste token at jwt.io
4. Check expiration time (exp field)
5. Let time pass (JWT_EXPIRATION_MS set to 3600000 = 1 hour)
6. ✅ After expiration, next API call returns 401
7. ✅ Frontend redirects to login

---

## Scenario 10: Multiple Roles Per User (Optional Enhancement)

**If admin decides to give user multiple roles:**

### Steps:
1. Register user: `multi@campus.edu`
2. Admin approves with **TECHNICIAN** role first
3. Backend extended to support multiple roles (would require UI changes)
4. User dashboard shows: "Roles: TECHNICIAN, MANAGER"
5. Access to both dashboards

---

## Common Test Data

### Bootstrap Admin (From .env)
- Email: `admin@campus.edu` (or configured value)
- Password: (from .env BOOTSTRAP_ADMIN_PASSWORD)
- Role: ADMIN
- Status: ACTIVE

### Test Accounts Template
```
Role         | Email             | Password
-------------|-------------------|----------
USER/Student | student1@campus   | Pass123
TECHNICIAN   | tech1@campus      | Pass123
MANAGER      | manager1@campus   | Pass123
TEST         | google-account    | (Google auth)
```

---

## Debugging Tips

### Check JWT Token Contents
1. Open DevTools (F12)
2. Console tab:
```javascript
const auth = JSON.parse(localStorage.getItem('smart-campus-auth'));
console.log(auth.token);
// Paste output at jwt.io to decode
```

### Check Backend Logs
```bash
# Terminal running backend:
# Look for:
# - Successfully authenticated user
# - Token generation log
# - Role assignment log
```

### Clear All Session Data
```javascript
// In browser console:
localStorage.removeItem('smart-campus-auth');
// Or delete Application > Local Storage > http://localhost:5173
```

### Test API Endpoints Directly
Use curl or Postman (see API_TESTING.md for precise examples)

---

## Success Criteria Checklist

- [ ] Credentials registration works
- [ ] Google registration works
- [ ] Email matching allows cross-method login
- [ ] Non-matching email blocks cross-method login
- [ ] Admin approval blocks unapproved login
- [ ] Different roles route to correct dashboards
- [ ] Protected routes redirect unauthorized users
- [ ] Token persists across page refreshes
- [ ] Logout clears all user data
- [ ] CORS allows fe-to-be communication

---

**All tests passed? ✅ System is fully functional!**
