import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongooseConnect';
import { Answer, User } from '@/lib/models';
import { authenticate, AuthRequest } from '@/lib/middleware';
import { errorResponse, HTTP_STATUS } from '@/lib/apiResponse';

// POST /api/answers/[id]/vote - Vote on an answer
async function voteAnswerHandler(
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
    const { voteType } = body; // 'upvote', 'downvote', or 'remove'

    if (!['upvote', 'downvote', 'remove'].includes(voteType)) {
      return errorResponse('Invalid vote type. Use "upvote", "downvote", or "remove"', HTTP_STATUS.BAD_REQUEST);
    }

    // Find answer
    const answer = await Answer.findById(answerId);
    if (!answer) {
      return errorResponse('Answer not found', HTTP_STATUS.NOT_FOUND);
    }

    // Can't vote on own answer
    if (answer.author.toString() === userId) {
      return errorResponse('You cannot vote on your own answer', HTTP_STATUS.BAD_REQUEST);
    }

    // Get author for reputation update
    const answerAuthor = await User.findById(answer.author);
    if (!answerAuthor) {
      return errorResponse('Answer author not found', HTTP_STATUS.NOT_FOUND);
    }

    // Check current vote status
    const hasUpvoted = answer.upvotedBy.some((id: any) => id.toString() === userId);
    const hasDownvoted = answer.downvotedBy.some((id: any) => id.toString() === userId);

    let reputationChange = 0;

    if (voteType === 'upvote') {
      if (hasUpvoted) {
        // Remove upvote
        answer.upvotedBy = answer.upvotedBy.filter((id: any) => id.toString() !== userId);
        answer.votes -= 1;
        reputationChange = -10; // Remove reputation from upvote
      } else {
        // Add upvote (remove downvote if exists)
        if (hasDownvoted) {
          answer.downvotedBy = answer.downvotedBy.filter((id: any) => id.toString() !== userId);
          answer.votes += 1;
          reputationChange = 2; // Remove downvote penalty
        }
        answer.upvotedBy.push(userId as any);
        answer.votes += 1;
        reputationChange += 10; // Add upvote reputation
      }
    } else if (voteType === 'downvote') {
      if (hasDownvoted) {
        // Remove downvote
        answer.downvotedBy = answer.downvotedBy.filter((id: any) => id.toString() !== userId);
        answer.votes += 1;
        reputationChange = 2;
      } else {
        // Add downvote (remove upvote if exists)
        if (hasUpvoted) {
          answer.upvotedBy = answer.upvotedBy.filter((id: any) => id.toString() !== userId);
          answer.votes -= 1;
          reputationChange = -10;
        }
        answer.downvotedBy.push(userId as any);
        answer.votes -= 1;
        reputationChange -= 2;
      }
    } else if (voteType === 'remove') {
      // Remove any existing vote
      if (hasUpvoted) {
        answer.upvotedBy = answer.upvotedBy.filter((id: any) => id.toString() !== userId);
        answer.votes -= 1;
        reputationChange = -10;
      } else if (hasDownvoted) {
        answer.downvotedBy = answer.downvotedBy.filter((id: any) => id.toString() !== userId);
        answer.votes += 1;
        reputationChange = 2;
      }
    }

    // Update answer author's reputation
    answerAuthor.reputation = Math.max(0, answerAuthor.reputation + reputationChange);
    await answerAuthor.save();

    // Save answer
    await answer.save();

    return NextResponse.json({
      success: true,
      message: 'Vote recorded successfully',
      answer: {
        id: answer._id,
        votes: answer.votes,
        hasUpvoted: answer.upvotedBy.some((id: any) => id.toString() === userId),
        hasDownvoted: answer.downvotedBy.some((id: any) => id.toString() === userId),
      },
      authorReputation: answerAuthor.reputation,
    });
  } catch (error: any) {
    console.error('Vote answer error:', error);
    return errorResponse('Failed to record vote', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

// Export handler
export const POST = authenticate(voteAnswerHandler);
