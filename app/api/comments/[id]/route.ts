import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongooseConnect';
import { Comment, User } from '@/lib/models';
import { authenticate, optionalAuth, AuthRequest } from '@/lib/middleware';
import { errorResponse, HTTP_STATUS } from '@/lib/apiResponse';

// GET /api/comments/[id] - Get a single comment
async function getCommentHandler(
  req: AuthRequest,
  context?: { params: { id: string } }
) {
  try {
    await connectDB();

    const commentId = context?.params?.id;
    if (!commentId) {
      return errorResponse('Comment ID is required', HTTP_STATUS.BAD_REQUEST);
    }

    const comment = await Comment.findById(commentId)
      .populate('author', 'username avatar reputation');

    if (!comment) {
      return errorResponse('Comment not found', HTTP_STATUS.NOT_FOUND);
    }

    const userId = req.user?.userId;

    return NextResponse.json({
      success: true,
      comment: {
        ...comment.toObject(),
        isAuthor: userId === comment.author._id.toString(),
      },
    });
  } catch (error: any) {
    console.error('Get comment error:', error);
    return errorResponse('Failed to fetch comment', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

// PUT /api/comments/[id] - Update a comment
async function updateCommentHandler(
  req: AuthRequest,
  context?: { params: { id: string } }
) {
  try {
    await connectDB();

    const userId = req.user?.userId;
    if (!userId) {
      return errorResponse('Authentication required', HTTP_STATUS.UNAUTHORIZED);
    }

    const commentId = context?.params?.id;
    if (!commentId) {
      return errorResponse('Comment ID is required', HTTP_STATUS.BAD_REQUEST);
    }

    const body = await req.json();
    const { content } = body;

    // Find comment
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return errorResponse('Comment not found', HTTP_STATUS.NOT_FOUND);
    }

    // Check if user is the author
    if (comment.author.toString() !== userId) {
      return errorResponse('You can only edit your own comments', HTTP_STATUS.FORBIDDEN);
    }

    // Validate content
    if (!content || content.length < 5 || content.length > 1000) {
      return errorResponse('Comment must be between 5 and 1000 characters', HTTP_STATUS.BAD_REQUEST);
    }

    // Update comment
    comment.content = content;
    comment.updatedAt = new Date();
    await comment.save();

    // Populate the comment
    const updatedComment = await Comment.findById(commentId)
      .populate('author', 'username avatar reputation');

    return NextResponse.json({
      success: true,
      message: 'Comment updated successfully',
      comment: updatedComment,
    });
  } catch (error: any) {
    console.error('Update comment error:', error);
    return errorResponse('Failed to update comment', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

// DELETE /api/comments/[id] - Delete a comment
async function deleteCommentHandler(
  req: AuthRequest,
  context?: { params: { id: string } }
) {
  try {
    await connectDB();

    const userId = req.user?.userId;
    if (!userId) {
      return errorResponse('Authentication required', HTTP_STATUS.UNAUTHORIZED);
    }

    const commentId = context?.params?.id;
    if (!commentId) {
      return errorResponse('Comment ID is required', HTTP_STATUS.BAD_REQUEST);
    }

    // Find comment
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return errorResponse('Comment not found', HTTP_STATUS.NOT_FOUND);
    }

    // Check if user is the author
    if (comment.author.toString() !== userId) {
      return errorResponse('You can only delete your own comments', HTTP_STATUS.FORBIDDEN);
    }

    // Delete the comment
    await Comment.findByIdAndDelete(commentId);

    return NextResponse.json({
      success: true,
      message: 'Comment deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete comment error:', error);
    return errorResponse('Failed to delete comment', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

// Export handlers
export const GET = optionalAuth(getCommentHandler);
export const PUT = authenticate(updateCommentHandler);
export const DELETE = authenticate(deleteCommentHandler);
