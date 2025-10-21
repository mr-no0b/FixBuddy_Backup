import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongooseConnect';
import { Comment, Answer, User } from '@/lib/models';
import { authenticate, AuthRequest } from '@/lib/middleware';
import { errorResponse, HTTP_STATUS } from '@/lib/apiResponse';

// POST /api/answers/[id]/comments - Add a comment to an answer
async function createAnswerCommentHandler(
  req: AuthRequest,
  context?: { params: { id: string } }
) {
  try {
    await connectDB();

    const userId = req.user?.userId;
    if (!userId) {
      return errorResponse('Authentication required', HTTP_STATUS.UNAUTHORIZED);
    }

    // Check if user is banned
    const user = await User.findById(userId);
    if (!user) {
      return errorResponse('User not found', HTTP_STATUS.NOT_FOUND);
    }
    if (user.isBanned) {
      return errorResponse('Your account has been banned. You cannot post comments.', HTTP_STATUS.FORBIDDEN);
    }

    const answerId = context?.params?.id;
    if (!answerId) {
      return errorResponse('Answer ID is required', HTTP_STATUS.BAD_REQUEST);
    }

    const body = await req.json();
    const { content } = body;

    // Validate input
    if (!content) {
      return errorResponse('Content is required', HTTP_STATUS.BAD_REQUEST);
    }

    if (content.length < 5 || content.length > 1000) {
      return errorResponse('Comment must be between 5 and 1000 characters', HTTP_STATUS.BAD_REQUEST);
    }

    // Verify answer exists
    const answer = await Answer.findById(answerId);
    if (!answer) {
      return errorResponse('Answer not found', HTTP_STATUS.NOT_FOUND);
    }

    // Create comment
    const newComment = await Comment.create({
      content,
      author: userId,
      parentType: 'answer',
      parentId: answerId,
      votes: 0,
      upvotedBy: [],
      downvotedBy: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Populate the comment
    const populatedComment = await Comment.findById(newComment._id)
      .populate('author', 'username avatar reputation');

    // Update user's last active time
    await User.findByIdAndUpdate(userId, { lastActiveAt: new Date() });

    return NextResponse.json({
      success: true,
      message: 'Comment added successfully',
      comment: populatedComment,
    }, { status: HTTP_STATUS.CREATED });
  } catch (error: any) {
    console.error('Create answer comment error:', error);
    return errorResponse('Failed to add comment', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

// GET /api/answers/[id]/comments - Get all comments for an answer
async function getAnswerCommentsHandler(
  req: AuthRequest,
  context?: { params: { id: string } }
) {
  try {
    await connectDB();

    const answerId = context?.params?.id;
    if (!answerId) {
      return errorResponse('Answer ID is required', HTTP_STATUS.BAD_REQUEST);
    }

    // Get comments
    const comments = await Comment.find({
      parentType: 'answer',
      parentId: answerId
    })
      .sort({ createdAt: 1 })
      .populate('author', 'username avatar reputation')
      .select('-upvotedBy -downvotedBy')
      .lean();

    const userId = req.user?.userId;

    return NextResponse.json({
      success: true,
      comments: comments.map(c => ({
        ...c,
        isAuthor: userId === c.author?._id?.toString(),
      })),
    });
  } catch (error: any) {
    console.error('Get answer comments error:', error);
    return errorResponse('Failed to fetch comments', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

// Export handlers
export const POST = authenticate(createAnswerCommentHandler);
export const GET = authenticate(getAnswerCommentsHandler);
