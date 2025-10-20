import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongooseConnect';
import { Comment, Question, User } from '@/lib/models';
import { authenticate, AuthRequest } from '@/lib/middleware';
import { errorResponse, HTTP_STATUS } from '@/lib/apiResponse';

// POST /api/questions/[id]/comments - Add a comment to a question
async function createQuestionCommentHandler(
  req: AuthRequest,
  context?: { params: { id: string } }
) {
  try {
    await connectDB();

    const userId = req.user?.userId;
    if (!userId) {
      return errorResponse('Authentication required', HTTP_STATUS.UNAUTHORIZED);
    }

    const questionId = context?.params?.id;
    if (!questionId) {
      return errorResponse('Question ID is required', HTTP_STATUS.BAD_REQUEST);
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

    // Verify question exists
    const question = await Question.findById(questionId);
    if (!question) {
      return errorResponse('Question not found', HTTP_STATUS.NOT_FOUND);
    }

    // Create comment
    const newComment = await Comment.create({
      content,
      author: userId,
      parentType: 'question',
      parentId: questionId,
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
    console.error('Create question comment error:', error);
    return errorResponse('Failed to add comment', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

// GET /api/questions/[id]/comments - Get all comments for a question
async function getQuestionCommentsHandler(
  req: AuthRequest,
  context?: { params: { id: string } }
) {
  try {
    await connectDB();

    const questionId = context?.params?.id;
    if (!questionId) {
      return errorResponse('Question ID is required', HTTP_STATUS.BAD_REQUEST);
    }

    // Get comments
    const comments = await Comment.find({
      parentType: 'question',
      parentId: questionId
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
    console.error('Get question comments error:', error);
    return errorResponse('Failed to fetch comments', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

// Export handlers
export const POST = authenticate(createQuestionCommentHandler);
export const GET = authenticate(getQuestionCommentsHandler);
