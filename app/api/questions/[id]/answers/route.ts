import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongooseConnect';
import { Answer, Question, User } from '@/lib/models';
import { authenticate, AuthRequest } from '@/lib/middleware';
import { errorResponse, HTTP_STATUS } from '@/lib/apiResponse';

// POST /api/questions/[id]/answers - Create an answer for a question
async function createAnswerHandler(
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
    const { content, images } = body;

    // Validate input
    if (!content) {
      return errorResponse('Content is required', HTTP_STATUS.BAD_REQUEST);
    }

    if (content.length < 20 || content.length > 10000) {
      return errorResponse('Content must be between 20 and 10000 characters', HTTP_STATUS.BAD_REQUEST);
    }

    // Find question
    const question = await Question.findById(questionId);
    if (!question) {
      return errorResponse('Question not found', HTTP_STATUS.NOT_FOUND);
    }

    // Check if question is closed
    if (question.status === 'closed') {
      return errorResponse('Cannot answer a closed question', HTTP_STATUS.BAD_REQUEST);
    }

    // Create answer
    const newAnswer = await Answer.create({
      content,
      author: userId,
      question: questionId,
      images: images || [],
      votes: 0,
      upvotedBy: [],
      downvotedBy: [],
      isAccepted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Add answer to question
    question.answers.push(newAnswer._id as any);
    question.updatedAt = new Date();
    await question.save();

    // Populate the answer
    const populatedAnswer = await Answer.findById(newAnswer._id)
      .populate('author', 'username avatar reputation');

    // Update user's last active time
    await User.findByIdAndUpdate(userId, { lastActiveAt: new Date() });

    return NextResponse.json({
      success: true,
      message: 'Answer created successfully',
      answer: populatedAnswer,
    }, { status: HTTP_STATUS.CREATED });
  } catch (error: any) {
    console.error('Create answer error:', error);
    return errorResponse('Failed to create answer', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

// GET /api/questions/[id]/answers - Get all answers for a question
async function getAnswersHandler(
  req: AuthRequest,
  context?: { params: { id: string } }
) {
  try {
    await connectDB();

    const questionId = context?.params?.id;
    if (!questionId) {
      return errorResponse('Question ID is required', HTTP_STATUS.BAD_REQUEST);
    }

    const { searchParams } = new URL(req.url);
    const sort = searchParams.get('sort') || 'votes'; // votes, oldest, newest

    // Sort options
    let sortOption: any = { votes: -1, createdAt: -1 }; // Default: highest votes
    switch (sort) {
      case 'oldest':
        sortOption = { createdAt: 1 };
        break;
      case 'newest':
        sortOption = { createdAt: -1 };
        break;
    }

    // Get answers
    const answers = await Answer.find({ question: questionId })
      .sort(sortOption)
      .populate('author', 'username avatar reputation')
      .select('-upvotedBy -downvotedBy')
      .lean();

    const userId = req.user?.userId;

    return NextResponse.json({
      success: true,
      answers: answers.map(a => ({
        ...a,
        isAuthor: userId === a.author?._id?.toString(),
      })),
    });
  } catch (error: any) {
    console.error('Get answers error:', error);
    return errorResponse('Failed to fetch answers', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

// Export handlers
export const POST = authenticate(createAnswerHandler);
export const GET = authenticate(getAnswersHandler);
