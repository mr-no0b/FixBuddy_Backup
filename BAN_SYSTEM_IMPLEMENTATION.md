# Ban System Implementation

## Overview
Implemented a comprehensive ban system that prevents banned users from creating content while still allowing them to view the site.

## What Banned Users CANNOT Do
- ❌ Post new questions
- ❌ Post answers
- ❌ Post comments on questions
- ❌ Post comments on answers

## What Banned Users CAN Still Do
- ✅ View questions, answers, and comments
- ✅ Browse the site
- ✅ See their profile (but cannot edit or post)

## Implementation Details

### API Endpoints Protected
All content creation endpoints now check if the user is banned before allowing them to post:

1. **POST /api/questions** - Create Question
   - Checks `user.isBanned` before allowing question creation
   - Returns 403 Forbidden with message: "Your account has been banned. You cannot post questions."

2. **POST /api/questions/[id]/answers** - Create Answer
   - Checks `user.isBanned` before allowing answer creation
   - Returns 403 Forbidden with message: "Your account has been banned. You cannot post answers."

3. **POST /api/questions/[id]/comments** - Comment on Question
   - Checks `user.isBanned` before allowing comment creation
   - Returns 403 Forbidden with message: "Your account has been banned. You cannot post comments."

4. **POST /api/answers/[id]/comments** - Comment on Answer
   - Checks `user.isBanned` before allowing comment creation
   - Returns 403 Forbidden with message: "Your account has been banned. You cannot post comments."

### Code Pattern Used
Each endpoint now follows this pattern:

```typescript
// After authentication check
const user = await User.findById(userId);
if (!user) {
  return errorResponse('User not found', HTTP_STATUS.NOT_FOUND);
}
if (user.isBanned) {
  return errorResponse('Your account has been banned. You cannot post [content type].', HTTP_STATUS.FORBIDDEN);
}
```

### HTTP Status Codes
- **403 FORBIDDEN**: Returned when a banned user tries to create content
- The error message clearly explains why the action is blocked

## Testing the Ban System

### Step 1: Ban a User
1. Login as admin at http://localhost:3000/admin/login
2. Find a user in the dashboard
3. Click "Ban" button

### Step 2: Test as Banned User
1. Login as the banned user
2. Try to:
   - Ask a question → Should show error
   - Post an answer → Should show error
   - Add a comment → Should show error

### Step 3: Verify Viewing Still Works
- Banned user can still browse questions
- Banned user can still view their profile
- Banned user can still see answers and comments

### Step 4: Unban User
1. Go back to admin dashboard
2. Click "Unban" button
3. User can now post again

## Files Modified

### API Routes
- `/app/api/questions/route.ts` - Added ban check to POST handler
- `/app/api/questions/[id]/answers/route.ts` - Added ban check to POST handler
- `/app/api/questions/[id]/comments/route.ts` - Added ban check to POST handler
- `/app/api/answers/[id]/comments/route.ts` - Added ban check to POST handler

### Database Fields (User Model)
- `isBanned`: boolean - Whether user is banned
- `bannedAt`: Date - When user was banned

## User Experience

### For Regular Users
- No changes - they continue using the site normally

### For Banned Users
- Clear error messages when trying to post
- Can still read and browse content
- Understand why their actions are blocked

### For Admins
- Simple ban/unban toggle in dashboard
- Real-time effect (banned users immediately cannot post)
- Can see banned status in user list

## Security Notes
- Ban checks happen server-side (API level)
- No frontend manipulation can bypass the ban
- User must authenticate first (so we know who to check)
- Ban status is stored in database and checked on every content creation attempt

## Future Enhancements (Optional)
If you want to add more features:
- Display ban message on banned user's profile
- Show ban notification in navbar when banned user logs in
- Add ban reason field
- Add temporary bans with expiry dates
- Email notification when user is banned/unbanned
- Ban history/audit log
