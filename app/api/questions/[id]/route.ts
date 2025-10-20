import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongooseConnect';
import { Question, Answer, User } from '@/lib/models';
import { authenticate, optionalAuth, AuthRequest } from '@/lib/middleware';
import { errorResponse, HTTP_STATUS } from '@/lib/apiResponse';

// GET /api/questions/[id] - Get a single question by ID
async function getQuestionHandler(
  req: AuthRequest,
  context?: { params: { id: string } }
) {
  try {
    await connectDB();

    const id = context?.params?.id;
    if (!id) {
      return errorResponse('Question ID is required', HTTP_STATUS.BAD_REQUEST);
    }

    // Find question
    const question = await Question.findById(id)
      .populate('author', 'username avatar reputation bio createdAt')
      .populate('tags', 'name slug icon description')
      .populate({
        path: 'answers',
        populate: {
          path: 'author',
          select: 'username avatar reputation'
        },
        options: { sort: { votes: -1, createdAt: -1 } }
      });

    if (!question) {
      return errorResponse('Question not found', HTTP_STATUS.NOT_FOUND);
    }

    // Increment view count (only if not the author)
    const userId = req.user?.userId;
    if (!userId || userId !== question.author._id.toString()) {
      question.views += 1;
      await question.save();
    }

    // Update user's last active time
    if (userId) {
      await User.findByIdAndUpdate(userId, { lastActiveAt: new Date() });
    }

    return NextResponse.json({
      success: true,
      question: {
        ...question.toObject(),
        isAuthor: userId === question.author._id.toString(),
        hasVoted: userId ? {
          upvoted: question.upvotedBy.some((id: any) => id.toString() === userId),
          downvoted: question.downvotedBy.some((id: any) => id.toString() === userId),
        } : null,
      },
    });
  } catch (error: any) {
    console.error('Get question error:', error);
    return errorResponse('Failed to fetch question', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

// PUT /api/questions/[id] - Update a question
async function updateQuestionHandler(
  req: AuthRequest,
  context?: { params: { id: string } }
) {
  try {
    await connectDB();

    const userId = req.user?.userId;
    if (!userId) {
      return errorResponse('Authentication required', HTTP_STATUS.UNAUTHORIZED);
    }

    const id = context?.params?.id;
    if (!id) {
      return errorResponse('Question ID is required', HTTP_STATUS.BAD_REQUEST);
    }
    const body = await req.json();
    const { title, content, tags, images } = body;

    // Find question
    const question = await Question.findById(id);
    if (!question) {
      return errorResponse('Question not found', HTTP_STATUS.NOT_FOUND);
    }

    // Check if user is the author
    if (question.author.toString() !== userId) {
      return errorResponse('You can only edit your own questions', HTTP_STATUS.FORBIDDEN);
    }

    // Validate input
    if (title && (title.length < 10 || title.length > 200)) {
      return errorResponse('Title must be between 10 and 200 characters', HTTP_STATUS.BAD_REQUEST);
    }

    if (content && (content.length < 30 || content.length > 10000)) {
      return errorResponse('Content must be between 30 and 10000 characters', HTTP_STATUS.BAD_REQUEST);
    }

    // Update fields
    if (title) question.title = title;
    if (content) question.content = content;
    if (images) question.images = images;
    
    // Handle tags update
    if (tags && Array.isArray(tags)) {
      const { Tag } = await import('@/lib/models');
      const tagIds: any[] = [];
      
      for (const tagName of tags) {
        let tag = await Tag.findOne({ name: tagName.toLowerCase() });
        if (!tag) {
          const slug = tagName.toLowerCase().replace(/\s+/g, '-');
          tag = await Tag.create({
            name: tagName.toLowerCase(),
            slug,
            usageCount: 1,
          });
        }
        tagIds.push(tag._id);
      }
      
      question.tags = tagIds;
    }

    question.updatedAt = new Date();
    await question.save();

    // Populate the response
    const updatedQuestion = await Question.findById(id)
      .populate('author', 'username avatar reputation')
      .populate('tags', 'name slug icon');

    return NextResponse.json({
      success: true,
      message: 'Question updated successfully',
      question: updatedQuestion,
    });
  } catch (error: any) {
    console.error('Update question error:', error);
    return errorResponse('Failed to update question', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

// DELETE /api/questions/[id] - Delete a question
async function deleteQuestionHandler(
  req: AuthRequest,
  context?: { params: { id: string } }
) {
  try {
    await connectDB();

    const userId = req.user?.userId;
    if (!userId) {
      return errorResponse('Authentication required', HTTP_STATUS.UNAUTHORIZED);
    }

    const id = context?.params?.id;
    if (!id) {
      return errorResponse('Question ID is required', HTTP_STATUS.BAD_REQUEST);
    }

    // Find question
    const question = await Question.findById(id);
    if (!question) {
      return errorResponse('Question not found', HTTP_STATUS.NOT_FOUND);
    }

    // Check if user is the author
    if (question.author.toString() !== userId) {
      return errorResponse('You can only delete your own questions', HTTP_STATUS.FORBIDDEN);
    }

    // Delete all associated answers
    if (question.answers && question.answers.length > 0) {
      await Answer.deleteMany({ _id: { $in: question.answers } });
    }

    // Delete the question
    await Question.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Question deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete question error:', error);
    return errorResponse('Failed to delete question', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

// Export handlers with middleware
export const GET = optionalAuth(getQuestionHandler);
export const PUT = authenticate(updateQuestionHandler);
export const DELETE = authenticate(deleteQuestionHandler);
