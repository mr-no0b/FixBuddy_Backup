import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongooseConnect';
import { Question, User } from '@/lib/models';
import { authenticate, AuthRequest } from '@/lib/middleware';
import { errorResponse, HTTP_STATUS } from '@/lib/apiResponse';

// POST /api/questions/[id]/vote - Vote on a question (upvote or downvote)
async function voteQuestionHandler(
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
    const { voteType } = body; // 'upvote', 'downvote', or 'remove'

    if (!['upvote', 'downvote', 'remove'].includes(voteType)) {
      return errorResponse('Invalid vote type. Use "upvote", "downvote", or "remove"', HTTP_STATUS.BAD_REQUEST);
    }

    // Find question
    const question = await Question.findById(id);
    if (!question) {
      return errorResponse('Question not found', HTTP_STATUS.NOT_FOUND);
    }

    // Can't vote on own question
    if (question.author.toString() === userId) {
      return errorResponse('You cannot vote on your own question', HTTP_STATUS.BAD_REQUEST);
    }

    // Get author for reputation update
    const questionAuthor = await User.findById(question.author);
    if (!questionAuthor) {
      return errorResponse('Question author not found', HTTP_STATUS.NOT_FOUND);
    }

    // Check current vote status
    const hasUpvoted = question.upvotedBy.some((id: any) => id.toString() === userId);
    const hasDownvoted = question.downvotedBy.some((id: any) => id.toString() === userId);

    let reputationChange = 0;

    if (voteType === 'upvote') {
      if (hasUpvoted) {
        // Remove upvote
        question.upvotedBy = question.upvotedBy.filter((id: any) => id.toString() !== userId);
        question.votes -= 1;
        reputationChange = -5; // Remove reputation gained from upvote
      } else {
        // Add upvote (remove downvote if exists)
        if (hasDownvoted) {
          question.downvotedBy = question.downvotedBy.filter((id: any) => id.toString() !== userId);
          question.votes += 1; // Remove downvote effect
          reputationChange = 2; // Remove downvote penalty
        }
        question.upvotedBy.push(userId as any);
        question.votes += 1;
        reputationChange += 5; // Add upvote reputation
      }
    } else if (voteType === 'downvote') {
      if (hasDownvoted) {
        // Remove downvote
        question.downvotedBy = question.downvotedBy.filter((id: any) => id.toString() !== userId);
        question.votes += 1;
        reputationChange = 2; // Remove penalty
      } else {
        // Add downvote (remove upvote if exists)
        if (hasUpvoted) {
          question.upvotedBy = question.upvotedBy.filter((id: any) => id.toString() !== userId);
          question.votes -= 1; // Remove upvote effect
          reputationChange = -5; // Remove upvote reputation
        }
        question.downvotedBy.push(userId as any);
        question.votes -= 1;
        reputationChange -= 2; // Add downvote penalty
      }
    } else if (voteType === 'remove') {
      // Remove any existing vote
      if (hasUpvoted) {
        question.upvotedBy = question.upvotedBy.filter((id: any) => id.toString() !== userId);
        question.votes -= 1;
        reputationChange = -5;
      } else if (hasDownvoted) {
        question.downvotedBy = question.downvotedBy.filter((id: any) => id.toString() !== userId);
        question.votes += 1;
        reputationChange = 2;
      }
    }

    // Update question author's reputation
    questionAuthor.reputation = Math.max(0, questionAuthor.reputation + reputationChange);
    await questionAuthor.save();

    // Save question
    await question.save();

    return NextResponse.json({
      success: true,
      message: 'Vote recorded successfully',
      question: {
        id: question._id,
        votes: question.votes,
        hasUpvoted: question.upvotedBy.some((id: any) => id.toString() === userId),
        hasDownvoted: question.downvotedBy.some((id: any) => id.toString() === userId),
      },
      authorReputation: questionAuthor.reputation,
    });
  } catch (error: any) {
    console.error('Vote question error:', error);
    return errorResponse('Failed to record vote', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

// Export handler with authentication
export const POST = authenticate(voteQuestionHandler);
