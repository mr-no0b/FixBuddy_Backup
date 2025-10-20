import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongooseConnect';
import { Question } from '@/lib/models';
import { optionalAuth, AuthRequest } from '@/lib/middleware';
import { errorResponse, HTTP_STATUS } from '@/lib/apiResponse';

// GET /api/users/[id]/questions - Get all questions by user
async function getUserQuestionsHandler(
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
    }

    // Get questions
    const questions = await Question.find({ author: userId })
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .populate('author', 'username avatar reputation')
      .populate('tags', 'name slug icon')
      .select('-upvotedBy -downvotedBy')
      .lean();

    const totalQuestions = await Question.countDocuments({ author: userId });
    const totalPages = Math.ceil(totalQuestions / limit);

    return NextResponse.json({
      success: true,
      questions: questions.map(q => ({
        ...q,
        answerCount: q.answers?.length || 0,
      })),
      pagination: {
        currentPage: page,
        totalPages,
        totalQuestions,
        limit,
        hasMore: page < totalPages,
      }
    });
  } catch (error: any) {
    console.error('Get user questions error:', error);
    return errorResponse('Failed to fetch user questions', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

// Export handler
export const GET = optionalAuth(getUserQuestionsHandler);
