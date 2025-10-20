import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongooseConnect';
import { Question, User, Tag } from '@/lib/models';
import { optionalAuth, AuthRequest } from '@/lib/middleware';
import { errorResponse, HTTP_STATUS } from '@/lib/apiResponse';

// GET /api/search - Global search across questions, users, and tags
async function searchHandler(req: AuthRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || searchParams.get('query');
    const type = searchParams.get('type') || 'all'; // all, questions, users, tags
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!query) {
      return errorResponse('Search query is required', HTTP_STATUS.BAD_REQUEST);
    }

    if (query.length < 2) {
      return errorResponse('Search query must be at least 2 characters', HTTP_STATUS.BAD_REQUEST);
    }

    const results: any = {};

    // Search Questions
    if (type === 'all' || type === 'questions') {
      const questions = await Question.find({
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { content: { $regex: query, $options: 'i' } }
        ]
      })
        .sort({ votes: -1, createdAt: -1 })
        .limit(limit)
        .populate('author', 'username avatar reputation')
        .populate('tags', 'name slug')
        .select('title content votes views answers status createdAt')
        .lean();

      // Filter out questions with null authors
      results.questions = questions
        .filter(q => q.author !== null)
        .map(q => ({
          ...q,
          answerCount: q.answers?.length || 0,
        }));
    }

    // Search Users
    if (type === 'all' || type === 'users') {
      const users = await User.find({
        $or: [
          { username: { $regex: query, $options: 'i' } },
          { bio: { $regex: query, $options: 'i' } }
        ]
      })
        .sort({ reputation: -1 })
        .limit(limit)
        .select('username avatar reputation bio createdAt')
        .lean();

      results.users = users;
    }

    // Search Tags
    if (type === 'all' || type === 'tags') {
      const tags = await Tag.find({
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } }
        ]
      })
        .sort({ usageCount: -1 })
        .limit(limit)
        .select('name slug description icon usageCount')
        .lean();

      results.tags = tags;
    }

    // Calculate total results
    const totalResults = (results.questions?.length || 0) + 
                         (results.users?.length || 0) + 
                         (results.tags?.length || 0);

    return NextResponse.json({
      success: true,
      query,
      type,
      totalResults,
      results,
    });
  } catch (error: any) {
    console.error('Search error:', error);
    return errorResponse('Search failed', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

// Export handler
export const GET = optionalAuth(searchHandler);
