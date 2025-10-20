import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongooseConnect';
import { User } from '@/lib/models';
import { optionalAuth, AuthRequest } from '@/lib/middleware';
import { errorResponse, HTTP_STATUS } from '@/lib/apiResponse';

// GET /api/users - Get users list (leaderboard)
async function getUsersHandler(req: AuthRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const sort = searchParams.get('sort') || 'reputation'; // reputation, newest, active
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;

    // Sort options
    let sortOption: any = { reputation: -1 };
    switch (sort) {
      case 'newest':
        sortOption = { createdAt: -1 };
        break;
      case 'active':
        sortOption = { lastActiveAt: -1 };
        break;
    }

    // Get users
    const users = await User.find()
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .select('username avatar reputation bio createdAt lastActiveAt')
      .lean();

    const totalUsers = await User.countDocuments();
    const totalPages = Math.ceil(totalUsers / limit);

    return NextResponse.json({
      success: true,
      users,
      pagination: {
        currentPage: page,
        totalPages,
        totalUsers,
        limit,
        hasMore: page < totalPages,
      }
    });
  } catch (error: any) {
    console.error('Get users error:', error);
    return errorResponse('Failed to fetch users', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

// Export handler
export const GET = optionalAuth(getUsersHandler);
