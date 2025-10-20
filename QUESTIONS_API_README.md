# Question API Documentation

## Overview
Complete CRUD operations for questions with pagination, sorting, filtering, and voting.

## API Endpoints

### 1. Get All Questions
**GET** `/api/questions`

**Query Parameters:**
- `page` (number, default: 1) - Page number
- `limit` (number, default: 20) - Items per page
- `sort` (string) - Sorting options:
  - `newest` (default) - Most recent first
  - `oldest` - Oldest first
  - `popular` - Highest votes and views
  - `views` - Most viewed
  - `unanswered` - Questions with no answers
  - `active` - Recently updated
- `tag` (string) - Filter by tag slug
- `search` (string) - Search in title and content
- `status` (string) - Filter by status: `open`, `closed`, `solved`

**Example Request:**
```bash
GET /api/questions?page=1&limit=20&sort=popular&tag=refrigerator
```

**Response (200):**
```json
{
  "success": true,
  "questions": [
    {
      "_id": "...",
      "title": "How to fix refrigerator not cooling",
      "content": "...",
      "author": {
        "_id": "...",
        "username": "john_doe",
        "avatar": null,
        "reputation": 125
      },
      "tags": [
        {
          "_id": "...",
          "name": "refrigerator",
          "slug": "refrigerator",
          "icon": null
        }
      ],
      "views": 150,
      "votes": 10,
      "answerCount": 3,
      "status": "open",
      "createdAt": "2025-10-20T...",
      "updatedAt": "2025-10-20T..."
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalQuestions": 95,
    "limit": 20,
    "hasMore": true
  }
}
```

---

### 2. Create Question
**POST** `/api/questions` (Protected)

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "How to fix refrigerator not cooling",
  "content": "My refrigerator stopped cooling properly. The freezer works fine but the fridge section is warm. What could be the problem?",
  "tags": ["refrigerator", "cooling", "repair"],
  "images": ["https://...jpg", "https://...jpg"]
}
```

**Validation:**
- Title: 10-200 characters
- Content: 30-10000 characters
- Tags: Optional array of strings

**Response (201):**
```json
{
  "success": true,
  "message": "Question created successfully",
  "question": {
    "_id": "...",
    "title": "How to fix refrigerator not cooling",
    "content": "...",
    "author": { ... },
    "tags": [ ... ],
    "views": 0,
    "votes": 0,
    "answers": [],
    "status": "open",
    "createdAt": "2025-10-20T...",
    "updatedAt": "2025-10-20T..."
  }
}
```

---

### 3. Get Question by ID
**GET** `/api/questions/[id]`

**Response (200):**
```json
{
  "success": true,
  "question": {
    "_id": "...",
    "title": "...",
    "content": "...",
    "author": { ... },
    "tags": [ ... ],
    "answers": [
      {
        "_id": "...",
        "content": "...",
        "author": { ... },
        "votes": 5,
        "isAccepted": false,
        "createdAt": "..."
      }
    ],
    "views": 151,
    "votes": 10,
    "status": "open",
    "isAuthor": false,
    "hasVoted": {
      "upvoted": false,
      "downvoted": false
    },
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

**Notes:**
- Automatically increments view count (except for author)
- `isAuthor` indicates if current user is the author
- `hasVoted` shows current user's vote status (null if not authenticated)

---

### 4. Update Question
**PUT** `/api/questions/[id]` (Protected, Author Only)

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Updated title",
  "content": "Updated content",
  "tags": ["new-tag", "another-tag"],
  "images": ["https://...jpg"]
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Question updated successfully",
  "question": { ... }
}
```

**Error (403):**
```json
{
  "success": false,
  "message": "You can only edit your own questions"
}
```

---

### 5. Delete Question
**DELETE** `/api/questions/[id]` (Protected, Author Only)

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Question deleted successfully"
}
```

**Notes:**
- Deletes all associated answers
- Only the author can delete their question

---

### 6. Vote on Question
**POST** `/api/questions/[id]/vote` (Protected)

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "voteType": "upvote"
}
```

**Vote Types:**
- `upvote` - Upvote the question (+1 vote, +5 reputation to author)
- `downvote` - Downvote the question (-1 vote, -2 reputation to author)
- `remove` - Remove your vote

**Response (200):**
```json
{
  "success": true,
  "message": "Vote recorded successfully",
  "question": {
    "id": "...",
    "votes": 11,
    "hasUpvoted": true,
    "hasDownvoted": false
  },
  "authorReputation": 130
}
```

**Voting Logic:**
- Can't vote on your own question
- Clicking upvote again removes the upvote
- Switching from upvote to downvote (or vice versa) updates both votes
- Reputation changes:
  - Upvote: +5 reputation
  - Downvote: -2 reputation
  - Removing vote: reverses reputation change

---

## Error Codes

| Status | Meaning |
|--------|---------|
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Not authorized for this action |
| 404 | Not Found - Resource not found |
| 500 | Server Error |

---

## Examples

### Create a Question
```javascript
const response = await fetch('/api/questions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    title: 'How to fix a leaking washing machine',
    content: 'My washing machine is leaking water from the bottom. What should I check first?',
    tags: ['washing-machine', 'leak', 'repair']
  })
});

const data = await response.json();
```

### Get Popular Questions
```javascript
const response = await fetch('/api/questions?sort=popular&limit=10');
const data = await response.json();

console.log(data.questions);
console.log(data.pagination);
```

### Vote on Question
```javascript
const response = await fetch('/api/questions/67890/vote', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ voteType: 'upvote' })
});

const data = await response.json();
```

### Search Questions
```javascript
const response = await fetch('/api/questions?search=refrigerator&sort=popular');
const data = await response.json();
```

---

## Testing

Use the test page at `/questions-test` to interactively test all question endpoints.

---

**Question API Complete! ✅**
