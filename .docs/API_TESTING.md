# API Testing Guide

Quick reference for testing Smart Campus authentication APIs using curl or Postman.

## 1. User Registration

### Register with Credentials
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@campus.edu",
    "password": "password123"
  }'
```

**Response (201 Created):**
```json
{
  "token": null,
  "tokenType": "Bearer",
  "email": "student@campus.edu",
  "roles": [],
  "provider": "LOCAL"
}
```

## 2. User Login

### Login with Credentials
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@campus.edu",
    "password": "password123"
  }'
```

**Response (if approved):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "email": "student@campus.edu",
  "roles": ["USER"],
  "provider": "LOCAL"
}
```

**Error (if pending):**
```json
{
  "status": 400,
  "error": "Account pending admin approval."
}
```

## 3. Admin Operations

### Get Pending Users
```bash
curl -X GET http://localhost:8080/api/admin/users/pending \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE"
```

**Response:**
```json
[
  {
    "id": "user-id-123",
    "email": "newuser@campus.edu",
    "provider": "LOCAL",
    "approvalStatus": "PENDING",
    "roles": [],
    "enabled": true
  }
]
```

### Approve User with Role
```bash
curl -X PATCH http://localhost:8080/api/admin/users/user-id-123/approve \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE" \
  -d '{
    "role": "USER"
  }'
```

**Allowed Roles:** USER, TECHNICIAN, MANAGER, ADMIN

**Response:**
```json
{
  "id": "user-id-123",
  "email": "newuser@campus.edu",
  "provider": "LOCAL",
  "approvalStatus": "ACTIVE",
  "roles": ["USER"],
  "enabled": true
}
```

### Reject User
```bash
curl -X PATCH http://localhost:8080/api/admin/users/user-id-123/reject \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE"
```

**Response:**
```json
{
  "id": "user-id-123",
  "email": "newuser@campus.edu",
  "provider": "LOCAL",
  "approvalStatus": "REJECTED",
  "roles": [],
  "enabled": false
}
```

## 4. User Profile

### Get Current User Profile
```bash
curl -X GET http://localhost:8080/api/user/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Response:**
```json
{
  "id": "user-id-123",
  "email": "student@campus.edu",
  "roles": ["USER"],
  "provider": "LOCAL",
  "enabled": true
}
```

## 5. Google OAuth2 Flow

### Initiate Google Login
Navigate to (browser):
```
http://localhost:8080/oauth2/authorization/google
```

### OAuth2 Redirect Callback (Handled by frontend)
```
http://localhost:5173/oauth2/redirect?token=JWT_TOKEN&email=user@gmail.com&provider=GOOGLE
```

## Common Errors & Solutions

### 401 Unauthorized
```json
{
  "status": 401,
  "error": "No account found for this email."
}
```
**Solution:** Register the email first

### 400 Bad Request - Account Pending
```json
{
  "status": 400,
  "error": "Account pending admin approval."
}
```
**Solution:** Wait for admin to approve and assign role

### 400 Bad Request - Google Account
```json
{
  "status": 400,
  "error": "This account is registered with Google. Use Google sign-in to continue."
}
```
**Solution:** Use Google sign-in instead of credentials

### 403 Forbidden - ADMIN endpoint
```json
{
  "status": 403,
  "error": "Access Denied"
}
```
**Solution:** Token must have ADMIN role

## Token Extraction

### From Browser LocalStorage
Open DevTools (F12) → Application → LocalStorage → Look for key `smart-campus-auth`:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "email": "user@campus.edu",
  "roles": ["USER"],
  "provider": "LOCAL"
}
```

### Decode JWT (online at jwt.io)
Paste token to decode and view:
- **Header:** Algorithm and token type
- **Payload:** User email, roles, issued time, expiration
- **Signature:** Verification signature

## Role-Based Endpoint Access

| Endpoint | Required Role |
|----------|---------------|
| POST /api/auth/register | None (Public) |
| POST /api/auth/login | None (Public) |
| GET /oauth2/authorization/google | None (Public) |
| GET /api/user/me | Any authenticated user |
| GET /api/admin/users/pending | ADMIN |
| PATCH /api/admin/users/{id}/approve | ADMIN |
| PATCH /api/admin/users/{id}/reject | ADMIN |

## Testing with Postman

1. Create new folder "Smart Campus API"
2. Create collection requests:

**Registration:**
- Method: POST
- URL: `{{base_url}}/api/auth/register`
- Body (JSON): email, password

**Login:**
- Method: POST
- URL: `{{base_url}}/api/auth/login`
- Body (JSON): email, password

**Set Variable after login:**
- In Tests tab:
```javascript
var jsonData = pm.response.json();
pm.environment.set("token", jsonData.token);
```

**Admin endpoints:**
- Add Authorization header:
- Type: Bearer Token
- Token: `{{token}}`

---

**Base URL Postman Variable:**
```
{{base_url}} = http://localhost:8080
```
