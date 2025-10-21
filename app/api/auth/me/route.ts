import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongooseConnect';
import User from '@/lib/models/User';
import { authenticate, AuthRequest } from '@/lib/middleware';

async function handler(req: AuthRequest) {
  try {
    await connectDB();

    // Get user from token (added by middleware)
    const userId = req.user?.userId;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User not authenticated' },
        { status: 401 }
      );
    }

    // Find user in database
    const user = await User.findById(userId).select('-passwordHash');

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          reputation: user.reputation,
          avatar: user.avatar,
          bio: user.bio,
          createdAt: user.createdAt,
          lastActiveAt: user.lastActiveAt,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

// Export with authentication middleware
export const GET = authenticate(handler);
