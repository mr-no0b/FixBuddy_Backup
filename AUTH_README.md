# Authentication System Documentation

## Overview
Complete authentication system for FixBuddy with JWT tokens, password hashing, and protected routes.

## Features
✅ User registration with validation
✅ User login with JWT tokens
✅ Logout functionality
✅ Get current user profile
✅ JWT middleware for protecting routes
✅ Password hashing with bcrypt
✅ Cookie-based and header-based authentication

## API Endpoints

### 1. Register User
**POST** `/api/auth/register`

**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "...",
    "username": "john_doe",
    "email": "john@example.com",
    "reputation": 0,
    "avatar": null
  },
  "token": "eyJhbGc..."
}
```

**Validation Rules:**
- Username: 3-30 characters, alphanumeric and underscores only
- Email: Valid email format
- Password: Minimum 6 characters

---

### 2. Login User
**POST** `/api/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "...",
    "username": "john_doe",
    "email": "john@example.com",
    "reputation": 0,
    "avatar": null,
    "bio": ""
  },
  "token": "eyJhbGc..."
}
```

---

### 3. Logout User
**POST** `/api/auth/logout`

**Response (200):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

### 4. Get Current User
**GET** `/api/auth/me`

**Headers:**
```
Authorization: Bearer <token>
```
Or use cookie-based authentication (automatic)

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "...",
    "username": "john_doe",
    "email": "john@example.com",
    "reputation": 0,
    "avatar": null,
    "bio": "",
    "createdAt": "2025-10-20T...",
    "lastActiveAt": "2025-10-20T..."
  }
}
```

---

## Using Authentication Middleware

### Protect a route (authentication required)
```typescript
import { authenticate, AuthRequest } from '@/lib/middleware';

async function handler(req: AuthRequest) {
  // req.user contains the authenticated user data
  const userId = req.user?.userId;
  
  // Your protected logic here
  return NextResponse.json({ success: true });
}

export const GET = authenticate(handler);
export const POST = authenticate(handler);
```

### Optional authentication (user data if available)
```typescript
import { optionalAuth, AuthRequest } from '@/lib/middleware';

async function handler(req: AuthRequest) {
  // req.user may or may not be present
  const userId = req.user?.userId;
  
  // Your logic here
  return NextResponse.json({ success: true });
}

export const GET = optionalAuth(handler);
```

---

## Client-Side Usage Examples

### Register
```typescript
const response = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'john_doe',
    email: 'john@example.com',
    password: 'password123'
  })
});

const data = await response.json();
```

### Login
```typescript
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'john@example.com',
    password: 'password123'
  })
});

const data = await response.json();
// Token is automatically stored in httpOnly cookie
```

### Get Current User
```typescript
const response = await fetch('/api/auth/me');
const data = await response.json();

if (data.success) {
  console.log('Current user:', data.user);
}
```

### Logout
```typescript
const response = await fetch('/api/auth/logout', {
  method: 'POST'
});

const data = await response.json();
```

---

## Environment Variables

Add to `.env.local`:
```env
MONGODB_URI=mongodb://localhost:27017/fixbuddy
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
```

**Important:** Change `JWT_SECRET` to a strong random string in production!

---

## Security Features

1. **Password Hashing**: Uses bcrypt with salt rounds = 10
2. **JWT Tokens**: 7-day expiration
3. **HttpOnly Cookies**: Prevents XSS attacks
4. **Secure Cookies**: Enabled in production
5. **Input Validation**: All inputs are validated
6. **Error Messages**: Generic messages to prevent enumeration attacks

---

## Error Codes

| Status | Meaning |
|--------|---------|
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Invalid credentials or token |
| 404 | Not Found - User not found |
| 409 | Conflict - User already exists |
| 500 | Server Error |

---

## Testing

### Test Registration
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Test Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Test Get Current User
```bash
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer <your-token>"
```

---

## File Structure

```
lib/
├── auth.ts                    # Authentication utilities
├── middleware.ts              # JWT middleware
├── mongooseConnect.ts         # MongoDB connection
└── models/
    └── User.ts               # User model

app/
└── api/
    └── auth/
        ├── register/
        │   └── route.ts      # POST /api/auth/register
        ├── login/
        │   └── route.ts      # POST /api/auth/login
        ├── logout/
        │   └── route.ts      # POST /api/auth/logout
        └── me/
            └── route.ts      # GET /api/auth/me
```

---

## Next Steps

After authentication is set up, you can:
1. Create Question API routes (CRUD operations)
2. Create Answer API routes
3. Build UI components (Login/Register forms)
4. Add AuthContext for client-side state management
5. Implement protected pages

---

**Authentication System Complete! ✅**
