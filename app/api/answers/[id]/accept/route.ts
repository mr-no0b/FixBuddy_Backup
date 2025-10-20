import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongooseConnect';
import { Answer, Question, User } from '@/lib/models';
import { authenticate, AuthRequest } from '@/lib/middleware';
import { errorResponse, HTTP_STATUS } from '@/lib/apiResponse';

// POST /api/answers/[id]/accept - Mark an answer as accepted
async function acceptAnswerHandler(
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

    // Find question
    const question = await Question.findById(answer.question);
    if (!question) {
      return errorResponse('Question not found', HTTP_STATUS.NOT_FOUND);
    }

    // Only question author can accept answers
    if (question.author.toString() !== userId) {
      return errorResponse('Only the question author can accept answers', HTTP_STATUS.FORBIDDEN);
    }

    // Get answer author for reputation update
    const answerAuthor = await User.findById(answer.author);
    if (!answerAuthor) {
      return errorResponse('Answer author not found', HTTP_STATUS.NOT_FOUND);
    }

    let message = '';
    let reputationChange = 0;

    if (answer.isAccepted) {
      // Unaccept the answer
      answer.isAccepted = false;
      question.acceptedAnswer = undefined;
      question.status = 'open';
      message = 'Answer unmarked as accepted';
      reputationChange = -15; // Remove accepted answer reputation
    } else {
      // If there's already an accepted answer, unaccept it first
      if (question.acceptedAnswer) {
        const previousAcceptedAnswer = await Answer.findById(question.acceptedAnswer);
        if (previousAcceptedAnswer) {
          previousAcceptedAnswer.isAccepted = false;
          await previousAcceptedAnswer.save();
          
          // Remove reputation from previous answer author
          const previousAuthor = await User.findById(previousAcceptedAnswer.author);
          if (previousAuthor) {
            previousAuthor.reputation = Math.max(0, previousAuthor.reputation - 15);
            await previousAuthor.save();
          }
        }
      }

      // Accept the new answer
      answer.isAccepted = true;
      question.acceptedAnswer = answer._id as any;
      question.status = 'solved';
      message = 'Answer marked as accepted';
      reputationChange = 15; // Add accepted answer reputation
    }

    // Update answer author's reputation
    answerAuthor.reputation = Math.max(0, answerAuthor.reputation + reputationChange);
    await answerAuthor.save();

    // Save changes
    await answer.save();
    await question.save();

    return NextResponse.json({
      success: true,
      message,
      answer: {
        id: answer._id,
        isAccepted: answer.isAccepted,
      },
      question: {
        id: question._id,
        status: question.status,
        acceptedAnswer: question.acceptedAnswer,
      },
      authorReputation: answerAuthor.reputation,
    });
  } catch (error: any) {
    console.error('Accept answer error:', error);
    return errorResponse('Failed to accept answer', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

// Export handler
export const POST = authenticate(acceptAnswerHandler);
