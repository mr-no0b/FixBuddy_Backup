# User Profile "Unknown User" Bug Fix

## Issue Description
On the user profile page (`/users/[id]`), the questions displayed in the "Recent Questions" section were showing "Unknown user" as the author, even for the profile owner's own questions.

## Root Cause
The API endpoint `/api/users/[id]` was fetching questions but **not populating the `author` field**. The query was only populating `tags` but missing the critical `.populate('author')` call.

### Code Before Fix
```typescript
const recentQuestions = await Question.find({ author: userId })
  .sort({ createdAt: -1 })
  .limit(5)
  .populate('tags', 'name slug')  // ← Only populating tags
  .select('title votes views answers status createdAt')
  .lean();
```

### Code After Fix
```typescript
const recentQuestions = await Question.find({ author: userId })
  .sort({ createdAt: -1 })
  .limit(5)
  .populate('author', 'username avatar reputation')  // ← Added author population
  .populate('tags', 'name slug')
  .select('title votes views answers status createdAt')
  .lean();
```

## File Modified
- **`/app/api/users/[id]/route.ts`** - Line 61
  - Added `.populate('author', 'username avatar reputation')` before `.populate('tags')`

## Why This Happened
The `QuestionCard` component expects question objects to have an `author` property with the following structure:
```typescript
author: {
  _id: string;
  username: string;
  avatar?: string;
  reputation: number;
}
```

When the author field is `null` or `undefined`, the component displays "Unknown user" as a fallback (line 200 in QuestionCard.tsx).

Without the `.populate('author')` call, Mongoose only returns the author's ObjectId reference, not the actual user data needed for display.

## Testing

### Before Fix
1. ✅ Navigate to your profile: `/users/[your-id]`
2. ❌ Recent questions show "Unknown user" as the author
3. ❌ No avatar or reputation displayed

### After Fix
1. ✅ Navigate to your profile: `/users/[your-id]`
2. ✅ Recent questions show your username
3. ✅ Your avatar and reputation are displayed
4. ✅ Click on the author name navigates to your profile

## Impact
This fix affects:
- ✅ User profile page - Recent Questions section
- ✅ Any page that uses the `/api/users/[id]?activity=true` endpoint
- ✅ Proper display of question author information

## Related Components
- `components/QuestionCard.tsx` - Displays question with author info
- `app/users/[id]/page.tsx` - User profile page that shows recent questions
- `app/api/users/[id]/route.ts` - API endpoint that fetches user data and activity

## Prevention
When writing Mongoose queries that fetch documents with references (ObjectIds), always remember to:
1. Use `.populate()` for any referenced fields you need to display
2. Specify the fields to populate: `.populate('fieldName', 'field1 field2')`
3. Test the component to verify all data is displayed correctly

## Additional Notes
The answer section doesn't show authors because it's designed to only show which question was answered, not who asked it. This is intentional and doesn't need to be changed.
