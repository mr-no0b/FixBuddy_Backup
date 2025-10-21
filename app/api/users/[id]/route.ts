import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongooseConnect';
import { User, Question, Answer } from '@/lib/models';
import { optionalAuth, AuthRequest } from '@/lib/middleware';
import { errorResponse, HTTP_STATUS } from '@/lib/apiResponse';

// GET /api/users/[id] - Get user profile
async function getUserProfileHandler(
  req: AuthRequest,
  context?: { params: { id: string } }
) {
  try {
    await connectDB();

    const userId = context?.params?.id;
    if (!userId) {
      return errorResponse('User ID is required', HTTP_STATUS.BAD_REQUEST);
    }

    // Find user
    const user = await User.findById(userId).select('-passwordHash');
    if (!user) {
      return errorResponse('User not found', HTTP_STATUS.NOT_FOUND);
    }

    const { searchParams } = new URL(req.url);
    const includeActivity = searchParams.get('activity') === 'true';

    // Get user statistics
    const questionCount = await Question.countDocuments({ author: userId });
    const answerCount = await Answer.countDocuments({ author: userId });
    const acceptedAnswerCount = await Answer.countDocuments({ 
      author: userId, 
      isAccepted: true 
    });

    const response: any = {
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        reputation: user.reputation,
        createdAt: user.createdAt,
        lastActiveAt: user.lastActiveAt,
        stats: {
          questions: questionCount,
          answers: answerCount,
          acceptedAnswers: acceptedAnswerCount,
        }
      }
    };

    // Include recent activity if requested
    if (includeActivity) {
      const recentQuestions = await Question.find({ author: userId })
        .sort({ createdAt: -1 })
        .populate('author', 'username avatar reputation')
        .populate('tags', 'name slug')
        .select('title votes views answers status createdAt')
        .lean();

      const recentAnswers = await Answer.find({ author: userId })
        .sort({ createdAt: -1 })
        .populate('question', 'title')
        .select('content votes isAccepted createdAt')
        .lean();

      response.activity = {
        recentQuestions: recentQuestions.map(q => ({
          ...q,
          answerCount: q.answers?.length || 0,
        })),
        recentAnswers,
      };
    }

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Get user profile error:', error);
    return errorResponse('Failed to fetch user profile', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

// Export handler
export const GET = optionalAuth(getUserProfileHandler);
