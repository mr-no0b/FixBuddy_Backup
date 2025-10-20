import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongooseConnect';
import { User } from '@/lib/models';
import { authenticate, AuthRequest } from '@/lib/middleware';
import { errorResponse, HTTP_STATUS } from '@/lib/apiResponse';

// PUT /api/users/[id]/profile - Update user profile
async function updateProfileHandler(
  req: AuthRequest,
  context?: { params: { id: string } }
) {
  try {
    await connectDB();

    const currentUserId = req.user?.userId;
    if (!currentUserId) {
      return errorResponse('Authentication required', HTTP_STATUS.UNAUTHORIZED);
    }

    const userId = context?.params?.id;
    if (!userId) {
      return errorResponse('User ID is required', HTTP_STATUS.BAD_REQUEST);
    }

    // Check if user is updating their own profile
    if (currentUserId !== userId) {
      return errorResponse('You can only update your own profile', HTTP_STATUS.FORBIDDEN);
    }

    const body = await req.json();
    const { username, bio, avatar } = body;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return errorResponse('User not found', HTTP_STATUS.NOT_FOUND);
    }

    // Validate username if provided
    if (username) {
      if (username.length < 3 || username.length > 30) {
        return errorResponse('Username must be between 3 and 30 characters', HTTP_STATUS.BAD_REQUEST);
      }

      // Check if username is already taken by another user
      const existingUser = await User.findOne({ 
        username, 
        _id: { $ne: userId } 
      });
      
      if (existingUser) {
        return errorResponse('Username already taken', HTTP_STATUS.CONFLICT);
      }

      user.username = username;
    }

    // Update bio
    if (bio !== undefined) {
      if (bio.length > 500) {
        return errorResponse('Bio cannot exceed 500 characters', HTTP_STATUS.BAD_REQUEST);
      }
      user.bio = bio;
    }

    // Update avatar
    if (avatar !== undefined) {
      user.avatar = avatar;
    }

    // Update last active time
    user.lastActiveAt = new Date();
    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        reputation: user.reputation,
      }
    });
  } catch (error: any) {
    console.error('Update profile error:', error);
    return errorResponse('Failed to update profile', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

// Export handler
export const PUT = authenticate(updateProfileHandler);
