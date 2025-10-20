import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongooseConnect';
import { Answer, Question, User } from '@/lib/models';
import { authenticate, optionalAuth, AuthRequest } from '@/lib/middleware';
import { errorResponse, HTTP_STATUS } from '@/lib/apiResponse';

// GET /api/answers/[id] - Get a single answer
async function getAnswerHandler(
  req: AuthRequest,
  context?: { params: { id: string } }
) {
  try {
    await connectDB();

    const answerId = context?.params?.id;
    if (!answerId) {
      return errorResponse('Answer ID is required', HTTP_STATUS.BAD_REQUEST);
    }

    const answer = await Answer.findById(answerId)
      .populate('author', 'username avatar reputation bio')
      .populate('question', 'title author');

    if (!answer) {
      return errorResponse('Answer not found', HTTP_STATUS.NOT_FOUND);
    }

    const userId = req.user?.userId;

    return NextResponse.json({
      success: true,
      answer: {
        ...answer.toObject(),
        isAuthor: userId === answer.author._id.toString(),
        hasVoted: userId ? {
          upvoted: answer.upvotedBy.some((id: any) => id.toString() === userId),
          downvoted: answer.downvotedBy.some((id: any) => id.toString() === userId),
        } : null,
      },
    });
  } catch (error: any) {
    console.error('Get answer error:', error);
    return errorResponse('Failed to fetch answer', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

// PUT /api/answers/[id] - Update an answer
async function updateAnswerHandler(
  req: AuthRequest,
  context?: { params: { id: string } }
) {
  try {
    await connectDB();

    const userId = req.user?.userId;
    if (!userId) {
      return errorResponse('Authentication required', HTTP_STATUS.UNAUTHORIZED);
    }

    const answerId = context?.params?.id;
    if (!answerId) {
      return errorResponse('Answer ID is required', HTTP_STATUS.BAD_REQUEST);
    }

    const body = await req.json();
    const { content, images } = body;

    // Find answer
    const answer = await Answer.findById(answerId);
    if (!answer) {
      return errorResponse('Answer not found', HTTP_STATUS.NOT_FOUND);
    }

    // Check if user is the author
    if (answer.author.toString() !== userId) {
      return errorResponse('You can only edit your own answers', HTTP_STATUS.FORBIDDEN);
    }

    // Validate content
    if (content && (content.length < 20 || content.length > 10000)) {
      return errorResponse('Content must be between 20 and 10000 characters', HTTP_STATUS.BAD_REQUEST);
    }

    // Update fields
    if (content) answer.content = content;
    if (images !== undefined) answer.images = images;
    answer.updatedAt = new Date();
    
    await answer.save();

    // Populate the answer
    const updatedAnswer = await Answer.findById(answerId)
      .populate('author', 'username avatar reputation');

    return NextResponse.json({
      success: true,
      message: 'Answer updated successfully',
      answer: updatedAnswer,
    });
  } catch (error: any) {
    console.error('Update answer error:', error);
    return errorResponse('Failed to update answer', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

// DELETE /api/answers/[id] - Delete an answer
async function deleteAnswerHandler(
  req: AuthRequest,
  context?: { params: { id: string } }
) {
  try {
    await connectDB();

    const userId = req.user?.userId;
    if (!userId) {
      return errorResponse('Authentication required', HTTP_STATUS.UNAUTHORIZED);
    }

    const answerId = context?.params?.id;
    if (!answerId) {
      return errorResponse('Answer ID is required', HTTP_STATUS.BAD_REQUEST);
    }

    // Find answer
    const answer = await Answer.findById(answerId);
    if (!answer) {
      return errorResponse('Answer not found', HTTP_STATUS.NOT_FOUND);
    }

    // Check if user is the author
    if (answer.author.toString() !== userId) {
      return errorResponse('You can only delete your own answers', HTTP_STATUS.FORBIDDEN);
    }

    // Remove answer from question
    const question = await Question.findById(answer.question);
    if (question) {
      question.answers = question.answers.filter(
        (id: any) => id.toString() !== answerId
      );
      
      // If this was the accepted answer, unset it
      if (question.acceptedAnswer?.toString() === answerId) {
        question.acceptedAnswer = undefined;
      }
      
      await question.save();
    }

    // Delete the answer
    await Answer.findByIdAndDelete(answerId);

    return NextResponse.json({
      success: true,
      message: 'Answer deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete answer error:', error);
    return errorResponse('Failed to delete answer', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

// Export handlers
export const GET = optionalAuth(getAnswerHandler);
export const PUT = authenticate(updateAnswerHandler);
export const DELETE = authenticate(deleteAnswerHandler);
