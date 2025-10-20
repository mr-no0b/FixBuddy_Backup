import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongooseConnect';
import { Answer } from '@/lib/models';
import { optionalAuth, AuthRequest } from '@/lib/middleware';
import { errorResponse, HTTP_STATUS } from '@/lib/apiResponse';

// GET /api/users/[id]/answers - Get all answers by user
async function getUserAnswersHandler(
  req: AuthRequest,
  context?: { params: { id: string } }
) {
  try {
    await connectDB();

    const userId = context?.params?.id;
    if (!userId) {
      return errorResponse('User ID is required', HTTP_STATUS.BAD_REQUEST);
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;
    const sort = searchParams.get('sort') || 'newest';

    // Sort options
    let sortOption: any = { createdAt: -1 };
    switch (sort) {
      case 'oldest':
        sortOption = { createdAt: 1 };
        break;
      case 'popular':
        sortOption = { votes: -1 };
        break;
      case 'accepted':
        sortOption = { isAccepted: -1, createdAt: -1 };
        break;
    }

    // Get answers
    const answers = await Answer.find({ author: userId })
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .populate('author', 'username avatar reputation')
      .populate('question', 'title author')
      .select('-upvotedBy -downvotedBy')
      .lean();

    const totalAnswers = await Answer.countDocuments({ author: userId });
    const totalPages = Math.ceil(totalAnswers / limit);

    return NextResponse.json({
      success: true,
      answers,
      pagination: {
        currentPage: page,
        totalPages,
        totalAnswers,
        limit,
        hasMore: page < totalPages,
      }
    });
  } catch (error: any) {
    console.error('Get user answers error:', error);
    return errorResponse('Failed to fetch user answers', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

// Export handler
export const GET = optionalAuth(getUserAnswersHandler);
