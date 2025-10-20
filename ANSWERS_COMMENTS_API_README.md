# Answer & Comment API Documentation

## Overview
Complete API for managing answers and comments with voting, accepting answers, and full CRUD operations.

---

## Answer Endpoints

### 1. Create Answer
**POST** `/api/questions/[id]/answers` (Protected)

Create a new answer for a question.

**Request Body:**
```json
{
  "content": "Check the thermostat settings and make sure the temperature is set correctly. Also, clean the condenser coils as dirty coils can prevent proper cooling.",
  "images": ["https://...jpg", "https://...jpg"]
}
```

**Validation:**
- Content: 20-10000 characters
- Cannot answer closed questions

**Response (201):**
```json
{
  "success": true,
  "message": "Answer created successfully",
  "answer": {
    "_id": "...",
    "content": "...",
    "author": {
      "username": "john_doe",
      "avatar": null,
      "reputation": 125
    },
    "question": "...",
    "votes": 0,
    "isAccepted": false,
    "createdAt": "..."
  }
}
```

---

### 2. Get All Answers for a Question
**GET** `/api/questions/[id]/answers` (Protected)

**Query Parameters:**
- `sort` (string) - Sorting options:
  - `votes` (default) - Highest votes first
  - `oldest` - Oldest first
  - `newest` - Newest first

**Response (200):**
```json
{
  "success": true,
  "answers": [
    {
      "_id": "...",
      "content": "...",
      "author": { ... },
      "votes": 15,
      "isAccepted": true,
      "isAuthor": false,
      "createdAt": "..."
    }
  ]
}
```

---

### 3. Get Single Answer
**GET** `/api/answers/[id]`

**Response (200):**
```json
{
  "success": true,
  "answer": {
    "_id": "...",
    "content": "...",
    "author": { ... },
    "question": {
      "title": "...",
      "author": "..."
    },
    "votes": 15,
    "isAccepted": true,
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

---

### 4. Update Answer
**PUT** `/api/answers/[id]` (Protected, Author Only)

**Request Body:**
```json
{
  "content": "Updated answer content with more details...",
  "images": ["https://...jpg"]
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Answer updated successfully",
  "answer": { ... }
}
```

---

### 5. Delete Answer
**DELETE** `/api/answers/[id]` (Protected, Author Only)

**Response (200):**
```json
{
  "success": true,
  "message": "Answer deleted successfully"
}
```

**Notes:**
- Removes answer from question
- If accepted answer, unsets acceptedAnswer on question

---

### 6. Vote on Answer
**POST** `/api/answers/[id]/vote` (Protected)

**Request Body:**
```json
{
  "voteType": "upvote"
}
```

**Vote Types:**
- `upvote` - Upvote (+1 vote, +10 reputation to author)
- `downvote` - Downvote (-1 vote, -2 reputation to author)
- `remove` - Remove your vote

**Response (200):**
```json
{
  "success": true,
  "message": "Vote recorded successfully",
  "answer": {
    "id": "...",
    "votes": 16,
    "hasUpvoted": true,
    "hasDownvoted": false
  },
  "authorReputation": 135
}
```

**Reputation System:**
- Upvote: **+10 reputation**
- Downvote: **-2 reputation**
- Can't vote on own answer

---

### 7. Accept Answer
**POST** `/api/answers/[id]/accept` (Protected, Question Author Only)

Mark an answer as the accepted solution.

**Response (200):**
```json
{
  "success": true,
  "message": "Answer marked as accepted",
  "answer": {
    "id": "...",
    "isAccepted": true
  },
  "question": {
    "id": "...",
    "status": "solved",
    "acceptedAnswer": "..."
  },
  "authorReputation": 150
}
```

**Features:**
- Only question author can accept
- Clicking again unaccepts the answer
- Automatically unaccepts previous answer
- Changes question status to "solved"
- Awards **+15 reputation** to answer author
- Removes reputation when unaccepted

---

## Comment Endpoints

### 8. Add Comment to Question
**POST** `/api/questions/[id]/comments` (Protected)

**Request Body:**
```json
{
  "content": "Great question! Have you checked the user manual?"
}
```

**Validation:**
- Content: 5-1000 characters

**Response (201):**
```json
{
  "success": true,
  "message": "Comment added successfully",
  "comment": {
    "_id": "...",
    "content": "...",
    "author": {
      "username": "john_doe",
      "avatar": null,
      "reputation": 125
    },
    "parentType": "question",
    "parentId": "...",
    "votes": 0,
    "createdAt": "..."
  }
}
```

---

### 9. Get Comments for Question
**GET** `/api/questions/[id]/comments` (Protected)

**Response (200):**
```json
{
  "success": true,
  "comments": [
    {
      "_id": "...",
      "content": "...",
      "author": { ... },
      "votes": 3,
      "isAuthor": false,
      "createdAt": "..."
    }
  ]
}
```

---

### 10. Add Comment to Answer
**POST** `/api/answers/[id]/comments` (Protected)

Same as question comments, but for answers.

**Request Body:**
```json
{
  "content": "This solution worked perfectly for me!"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Comment added successfully",
  "comment": { ... }
}
```

---

### 11. Get Comments for Answer
**GET** `/api/answers/[id]/comments` (Protected)

**Response (200):**
```json
{
  "success": true,
  "comments": [ ... ]
}
```

---

### 12. Get Single Comment
**GET** `/api/comments/[id]`

**Response (200):**
```json
{
  "success": true,
  "comment": {
    "_id": "...",
    "content": "...",
    "author": { ... },
    "parentType": "question",
    "parentId": "...",
    "votes": 5,
    "isAuthor": false,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

---

### 13. Update Comment
**PUT** `/api/comments/[id]` (Protected, Author Only)

**Request Body:**
```json
{
  "content": "Updated comment content"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Comment updated successfully",
  "comment": { ... }
}
```

---

### 14. Delete Comment
**DELETE** `/api/comments/[id]` (Protected, Author Only)

**Response (200):**
```json
{
  "success": true,
  "message": "Comment deleted successfully"
}
```

---

## Reputation System Summary

| Action | Reputation Change |
|--------|------------------|
| Question Upvote | +5 |
| Question Downvote | -2 |
| Answer Upvote | **+10** |
| Answer Downvote | -2 |
| Answer Accepted | **+15** |

---

## Examples

### Create an Answer
```javascript
const response = await fetch('/api/questions/123/answers', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    content: 'Check the thermostat settings...',
    images: []
  })
});
```

### Vote on Answer
```javascript
await fetch('/api/answers/456/vote', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ voteType: 'upvote' })
});
```

### Accept Answer
```javascript
await fetch('/api/answers/456/accept', {
  method: 'POST'
});
```

### Add Comment
```javascript
await fetch('/api/questions/123/comments', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    content: 'Great question!'
  })
});
```

---

## Error Codes

| Status | Meaning |
|--------|---------|
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Not authorized |
| 404 | Not Found - Resource not found |
| 500 | Server Error |

---

**Answer & Comment API Complete! ✅**
