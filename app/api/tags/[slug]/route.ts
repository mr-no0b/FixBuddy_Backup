import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongooseConnect';
import { Tag, Question } from '@/lib/models';
import { optionalAuth, AuthRequest } from '@/lib/middleware';
import { errorResponse, HTTP_STATUS } from '@/lib/apiResponse';

// GET /api/tags/[slug] - Get questions by tag
async function getTagQuestionsHandler(
  req: AuthRequest,
  context?: { params: { slug: string } }
) {
  try {
    await connectDB();

    const slug = context?.params?.slug;
    if (!slug) {
      return errorResponse('Tag slug is required', HTTP_STATUS.BAD_REQUEST);
    }

    // Find tag
    const tag = await Tag.findOne({ slug });
    if (!tag) {
      return errorResponse('Tag not found', HTTP_STATUS.NOT_FOUND);
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;
    const sort = searchParams.get('sort') || 'newest';

    // Sort options
    let sortOption: any = { createdAt: -1 };
    switch (sort) {
      case 'oldest':
        sortOption = { createdAt: 1 };
        break;
      case 'popular':
        sortOption = { votes: -1, views: -1 };
        break;
      case 'unanswered':
        sortOption = { createdAt: -1 };
        break;
    }

    // Build query
    const query: any = { tags: tag._id };
    if (sort === 'unanswered') {
      query.answers = { $size: 0 };
    }

    // Get questions
    const questions = await Question.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .populate('author', 'username avatar reputation')
      .populate('tags', 'name slug icon')
      .select('-upvotedBy -downvotedBy')
      .lean();

    // Filter out questions with null authors
    const validQuestions = questions.filter(q => q.author !== null);

    const totalQuestions = await Question.countDocuments(query);
    const totalPages = Math.ceil(totalQuestions / limit);

    return NextResponse.json({
      success: true,
      tag: {
        name: tag.name,
        slug: tag.slug,
        description: tag.description,
        icon: tag.icon,
        usageCount: tag.usageCount,
      },
      questions: validQuestions.map(q => ({
        ...q,
        answerCount: q.answers?.length || 0,
      })),
      pagination: {
        currentPage: page,
        totalPages,
        totalQuestions,
        limit,
        hasMore: page < totalPages,
      }
    });
  } catch (error: any) {
    console.error('Get tag questions error:', error);
    return errorResponse('Failed to fetch tag questions', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

// Export handler
export const GET = optionalAuth(getTagQuestionsHandler);
