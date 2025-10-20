# Tag, User Profile & Search API Documentation

## Overview
Complete API for tags, user profiles, and global search functionality.

---

## Tag Endpoints

### 1. Get All Tags
**GET** `/api/tags`

Get all tags with usage statistics.

**Query Parameters:**
- `sort` (string) - Sorting options:
  - `popular` (default) - Most used tags
  - `name` - Alphabetical order
  - `newest` - Recently created
- `limit` (number, default: 50) - Number of tags to return
- `search` (string) - Search in tag name or description

**Example Request:**
```bash
GET /api/tags?sort=popular&limit=20
```

**Response (200):**
```json
{
  "success": true,
  "tags": [
    {
      "_id": "...",
      "name": "refrigerator",
      "slug": "refrigerator",
      "description": "Questions about refrigerators and cooling issues",
      "icon": null,
      "usageCount": 45,
      "createdAt": "2025-10-20T..."
    }
  ],
  "total": 15
}
```

---

### 2. Create Tag
**POST** `/api/tags`

Create a new tag (for admin or auto-creation).

**Request Body:**
```json
{
  "name": "Washing Machine",
  "description": "Questions about washing machines",
  "icon": "🧺"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Tag created successfully",
  "tag": {
    "_id": "...",
    "name": "washing machine",
    "slug": "washing-machine",
    "description": "Questions about washing machines",
    "icon": "🧺",
    "usageCount": 0
  }
}
```

---

### 3. Get Questions by Tag
**GET** `/api/tags/[slug]`

Get all questions with a specific tag.

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)
- `sort` (string) - `newest`, `oldest`, `popular`, `unanswered`

**Example Request:**
```bash
GET /api/tags/refrigerator?page=1&sort=popular
```

**Response (200):**
```json
{
  "success": true,
  "tag": {
    "name": "refrigerator",
    "slug": "refrigerator",
    "description": "...",
    "icon": null,
    "usageCount": 45
  },
  "questions": [
    {
      "_id": "...",
      "title": "How to fix refrigerator not cooling",
      "author": { ... },
      "tags": [ ... ],
      "votes": 10,
      "views": 150,
      "answerCount": 3,
      "status": "open",
      "createdAt": "..."
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalQuestions": 45,
    "limit": 20,
    "hasMore": true
  }
}
```

---

## User Profile Endpoints

### 4. Get User Profile
**GET** `/api/users/[id]`

Get detailed user profile with statistics.

**Query Parameters:**
- `activity` (boolean) - Include recent activity (default: false)

**Example Request:**
```bash
GET /api/users/123abc?activity=true
```

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "...",
    "username": "john_doe",
    "email": "john@example.com",
    "avatar": "https://...",
    "bio": "Home appliance repair enthusiast",
    "reputation": 350,
    "createdAt": "2025-09-15T...",
    "lastActiveAt": "2025-10-20T...",
    "stats": {
      "questions": 15,
      "answers": 42,
      "acceptedAnswers": 12
    }
  },
  "activity": {
    "recentQuestions": [
      {
        "title": "...",
        "votes": 5,
        "views": 80,
        "answerCount": 3,
        "status": "open",
        "tags": [ ... ],
        "createdAt": "..."
      }
    ],
    "recentAnswers": [
      {
        "content": "...",
        "votes": 8,
        "isAccepted": true,
        "question": {
          "title": "..."
        },
        "createdAt": "..."
      }
    ]
  }
}
```

---

### 5. Update User Profile
**PUT** `/api/users/[id]/profile` (Protected, Owner Only)

Update user profile information.

**Request Body:**
```json
{
  "username": "new_username",
  "bio": "Updated bio text",
  "avatar": "https://new-avatar-url.jpg"
}
```

**Validation:**
- Username: 3-30 characters, must be unique
- Bio: Max 500 characters
- Avatar: URL string

**Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {
    "id": "...",
    "username": "new_username",
    "email": "john@example.com",
    "avatar": "https://new-avatar-url.jpg",
    "bio": "Updated bio text",
    "reputation": 350
  }
}
```

**Error (403):**
```json
{
  "success": false,
  "message": "You can only update your own profile"
}
```

---

### 6. Get User's Questions
**GET** `/api/users/[id]/questions`

Get all questions by a specific user.

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)
- `sort` (string) - `newest`, `oldest`, `popular`

**Response (200):**
```json
{
  "success": true,
  "questions": [ ... ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 2,
    "totalQuestions": 15,
    "limit": 20,
    "hasMore": false
  }
}
```

---

### 7. Get User's Answers
**GET** `/api/users/[id]/answers`

Get all answers by a specific user.

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)
- `sort` (string) - `newest`, `oldest`, `popular`, `accepted`

**Response (200):**
```json
{
  "success": true,
  "answers": [
    {
      "_id": "...",
      "content": "...",
      "author": { ... },
      "question": {
        "title": "...",
        "author": "..."
      },
      "votes": 8,
      "isAccepted": true,
      "createdAt": "..."
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalAnswers": 42,
    "limit": 20,
    "hasMore": true
  }
}
```

---

### 8. Get Users Leaderboard
**GET** `/api/users`

Get list of users (leaderboard).

**Query Parameters:**
- `sort` (string) - Sorting options:
  - `reputation` (default) - Highest reputation
  - `newest` - Recently joined
  - `active` - Recently active
- `page` (number, default: 1)
- `limit` (number, default: 20)

**Response (200):**
```json
{
  "success": true,
  "users": [
    {
      "_id": "...",
      "username": "john_doe",
      "avatar": "...",
      "reputation": 850,
      "bio": "...",
      "createdAt": "...",
      "lastActiveAt": "..."
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalUsers": 98,
    "limit": 20,
    "hasMore": true
  }
}
```

---

## Search Endpoint

### 9. Global Search
**GET** `/api/search`

Search across questions, users, and tags.

**Query Parameters:**
- `q` or `query` (string, required) - Search query (min 2 chars)
- `type` (string) - Search type:
  - `all` (default) - Search everything
  - `questions` - Search only questions
  - `users` - Search only users
  - `tags` - Search only tags
- `limit` (number, default: 10) - Results per type

**Example Request:**
```bash
GET /api/search?q=refrigerator&type=all&limit=5
```

**Response (200):**
```json
{
  "success": true,
  "query": "refrigerator",
  "type": "all",
  "totalResults": 12,
  "results": {
    "questions": [
      {
        "title": "How to fix refrigerator not cooling",
        "content": "...",
        "author": { ... },
        "tags": [ ... ],
        "votes": 10,
        "views": 150,
        "answerCount": 3,
        "status": "open",
        "createdAt": "..."
      }
    ],
    "users": [
      {
        "username": "fridge_expert",
        "avatar": "...",
        "reputation": 450,
        "bio": "Refrigerator repair specialist",
        "createdAt": "..."
      }
    ],
    "tags": [
      {
        "name": "refrigerator",
        "slug": "refrigerator",
        "description": "Questions about refrigerators",
        "icon": null,
        "usageCount": 45
      }
    ]
  }
}
```

---

## Examples

### Search for Questions
```javascript
const response = await fetch('/api/search?q=washing machine&type=questions');
const data = await response.json();
console.log(data.results.questions);
```

### Get Popular Tags
```javascript
const response = await fetch('/api/tags?sort=popular&limit=10');
const data = await response.json();
console.log(data.tags);
```

### Get User Profile with Activity
```javascript
const response = await fetch('/api/users/123abc?activity=true');
const data = await response.json();
console.log(data.user.stats);
console.log(data.activity.recentQuestions);
```

### Update Profile
```javascript
const response = await fetch('/api/users/123abc/profile', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    bio: 'Updated bio',
    avatar: 'https://new-avatar.jpg'
  })
});
```

### Get Questions by Tag
```javascript
const response = await fetch('/api/tags/refrigerator?sort=popular&page=1');
const data = await response.json();
console.log(data.tag);
console.log(data.questions);
```

---

## Error Codes

| Status | Meaning |
|--------|---------|
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Not authorized |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists |
| 500 | Server Error |

---

**Tag, User Profile & Search API Complete! ✅**
