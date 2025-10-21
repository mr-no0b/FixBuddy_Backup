# How to Add Avatar for Users in FixBuddy

## Overview
FixBuddy supports user avatars. The `avatar` field in the User model accepts a URL string pointing to an image.

## Methods to Add Avatars

### Method 1: Using Gravatar (Recommended - Already Working!)
Gravatar automatically generates avatars based on email addresses. This is already implemented in your app!

**How it works:**
- When a user registers with an email, the app generates a Gravatar URL
- Gravatar shows a unique avatar for each email
- If the user has a Gravatar account, their custom avatar shows
- If not, Gravatar generates a default avatar (identicon)

**No action needed** - This is already working in your app!

---

### Method 2: Manual Avatar Upload (For Future Implementation)

If you want users to upload their own avatars, here are the steps:

#### Option A: Using External Services (Easiest)

**1. Using Cloudinary (Free tier available)**

```bash
npm install cloudinary
npm install next-cloudinary
```

Create `.env.local`:
```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**2. Using Uploadthing (Built for Next.js)**

```bash
npm install uploadthing @uploadthing/react
```

Setup at: https://uploadthing.com

#### Option B: Local Storage (Development Only)

Store images in `/public/avatars/` folder:
- Not recommended for production
- Files stored on server take up space
- Harder to scale

---

### Method 3: Use Avatar URL from Social Login

If you add OAuth (Google, GitHub, etc.):
- Get avatar URL from the OAuth provider
- Store it in the `avatar` field

Example:
```typescript
// When user logs in with Google
user.avatar = googleProfile.picture;
```

---

## Current Implementation Status

### ✅ What's Already Working:

1. **Gravatar Integration**
   - Every user automatically gets a Gravatar
   - Based on their email address
   - Shows unique colorful patterns

2. **Avatar Display**
   - Shows in Navbar
   - Shows in Question cards (author avatar)
   - Shows in User Profile
   - Shows in Comments

3. **Fallback System**
   - If no avatar URL: Shows Gravatar
   - If Gravatar fails: Shows initials in colored circle

### 📝 Where Avatars Are Used:

1. **Navbar** (`components/Navbar.tsx`)
   - User dropdown menu
   - Shows current user's avatar

2. **User Profile** (`components/UserProfileCard.tsx`)
   - Large avatar display
   - Profile page header

3. **Question Cards** (`components/QuestionCard.tsx`)
   - Author's avatar next to questions

4. **Comments** 
   - Author's avatar in comment threads

5. **Answer Cards** (`components/AnswerCard.tsx`)
   - Author's avatar next to answers

---

## How to Change a User's Avatar

### Option 1: Update via Seed Script (Development)

Edit `scripts/seed.ts`:

```typescript
const users = [
  {
    username: 'john_doe',
    email: 'john@example.com',
    passwordHash: await bcrypt.hash('password123', 10),
    avatar: 'https://i.pravatar.cc/150?img=1', // Add this line
    bio: 'Love fixing electronics!',
    reputation: 250,
  },
  // ... more users
];
```

Then run:
```bash
npx tsx scripts/seed.ts
```

### Option 2: Update Directly in Database (MongoDB Compass)

1. Open MongoDB Compass
2. Connect to your database
3. Find the `users` collection
4. Find the user document
5. Add/Update the `avatar` field:
   ```json
   {
     "avatar": "https://i.pravatar.cc/150?img=5"
   }
   ```
6. Save

### Option 3: Create API Endpoint (For Users to Update)

Create `/app/api/users/[id]/avatar/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongooseConnect';
import User from '@/lib/models/User';
import { authenticate, AuthRequest } from '@/lib/middleware';

async function updateAvatarHandler(
  req: AuthRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();
  
  const userId = req.user?.userId;
  const { id } = await params;
  
  // Only allow users to update their own avatar
  if (userId !== id) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 403 }
    );
  }
  
  const { avatarUrl } = await req.json();
  
  const user = await User.findByIdAndUpdate(
    id,
    { avatar: avatarUrl },
    { new: true }
  );
  
  return NextResponse.json({
    success: true,
    user
  });
}

export const PUT = authenticate(updateAvatarHandler);
```

---

## Free Avatar URL Services

You can use these services to get avatar URLs:

1. **Pravatar.cc** (No signup required)
   ```
   https://i.pravatar.cc/150?img=1
   https://i.pravatar.cc/150?img=2
   (Use any number 1-70 for different avatars)
   ```

2. **UI Avatars** (Generates from initials)
   ```
   https://ui-avatars.com/api/?name=John+Doe&background=0D8ABC&color=fff
   ```

3. **DiceBear** (Customizable avatars)
   ```
   https://api.dicebear.com/7.x/avataaars/svg?seed=John
   https://api.dicebear.com/7.x/pixel-art/svg?seed=John
   ```

4. **Robohash** (Robot/monster avatars)
   ```
   https://robohash.org/john@example.com
   ```

---

## Example: Update User Avatar Manually

Let's say you want to give user `john@example.com` a custom avatar:

### Using MongoDB Shell:
```javascript
db.users.updateOne(
  { email: "john@example.com" },
  { $set: { avatar: "https://i.pravatar.cc/150?img=12" } }
)
```

### Using Mongoose (Node.js):
```javascript
const user = await User.findOne({ email: 'john@example.com' });
user.avatar = 'https://i.pravatar.cc/150?img=12';
await user.save();
```

---

## Testing Avatars

1. **Check Gravatar**
   - Go to https://gravatar.com
   - See what avatar your email has
   - Upload a custom one if you want

2. **Test Different URLs**
   - Update user's avatar in database
   - Refresh the page
   - Avatar should update everywhere

3. **Test Fallback**
   - Set avatar to invalid URL
   - Should show initials instead

---

## Summary

**Current Status:**
- ✅ Gravatar working automatically
- ✅ Avatar displays everywhere in the app
- ✅ Fallback to initials if no avatar

**To Add Custom Avatars:**
- Use free avatar services (Pravatar, UI Avatars, etc.)
- Update the `avatar` field in database
- Or implement file upload with Cloudinary/Uploadthing

**Easiest Way Right Now:**
1. Use Pravatar.cc URLs: `https://i.pravatar.cc/150?img=X` (X = 1-70)
2. Update user in database or seed script
3. Refresh page - done!

**Example:**
```typescript
// In seed script
avatar: 'https://i.pravatar.cc/150?img=5'

// Or in MongoDB
{ avatar: "https://i.pravatar.cc/150?img=5" }
```

That's it! Your users will have beautiful avatars! 🎨
