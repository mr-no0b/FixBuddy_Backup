import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongooseConnect';
import { Question, Answer, Tag, User } from '@/lib/models';
import { authenticate, optionalAuth, AuthRequest } from '@/lib/middleware';
import { errorResponse, successResponse, HTTP_STATUS } from '@/lib/apiResponse';

// GET /api/questions - Get all questions with pagination and sorting
async function getQuestionsHandler(req: AuthRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Sorting
    const sort = searchParams.get('sort') || 'newest';
    const tag = searchParams.get('tag');
    const search = searchParams.get('search');
    const status = searchParams.get('status');

    // Build query
    const query: any = {};

    if (tag) {
      const tagDoc = await Tag.findOne({ slug: tag });
      if (tagDoc) {
        query.tags = tagDoc._id;
      }
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    if (status) {
      query.status = status;
    }

    // Sort options
    let sortOption: any = { createdAt: -1 }; // Default: newest
    switch (sort) {
      case 'oldest':
        sortOption = { createdAt: 1 };
        break;
      case 'popular':
        sortOption = { votes: -1, views: -1 };
        break;
      case 'views':
        sortOption = { views: -1 };
        break;
      case 'unanswered':
        query.answers = { $size: 0 };
        break;
      case 'active':
        sortOption = { updatedAt: -1 };
        break;
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

    // Get total count
    const totalQuestions = await Question.countDocuments(query);
    const totalPages = Math.ceil(totalQuestions / limit);

    // Filter out questions with null authors (deleted users)
    const validQuestions = questions.filter(q => q.author !== null);

    return NextResponse.json({
      success: true,
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
    console.error('Get questions error:', error);
    return errorResponse('Failed to fetch questions', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

// POST /api/questions - Create a new question
async function createQuestionHandler(req: AuthRequest) {
  try {
    await connectDB();

    const userId = req.user?.userId;
    if (!userId) {
      return errorResponse('Authentication required', HTTP_STATUS.UNAUTHORIZED);
    }

    // Check if user is banned
    const user = await User.findById(userId);
    if (!user) {
      return errorResponse('User not found', HTTP_STATUS.NOT_FOUND);
    }
    if (user.isBanned) {
      return errorResponse('Your account has been banned. You cannot post questions.', HTTP_STATUS.FORBIDDEN);
    }

    const body = await req.json();
    const { title, content, tags, images } = body;

    // Validate input
    if (!title || !content) {
      return errorResponse('Title and content are required', HTTP_STATUS.BAD_REQUEST);
    }

    if (title.length < 10 || title.length > 200) {
      return errorResponse('Title must be between 10 and 200 characters', HTTP_STATUS.BAD_REQUEST);
    }

    if (content.length < 30 || content.length > 10000) {
      return errorResponse('Content must be between 30 and 10000 characters', HTTP_STATUS.BAD_REQUEST);
    }

    // Process tags
    let tagIds: any[] = [];
    if (tags && Array.isArray(tags)) {
      for (const tagName of tags) {
        let tag = await Tag.findOne({ name: tagName.toLowerCase() });
        
        // Create tag if it doesn't exist
        if (!tag) {
          const slug = tagName.toLowerCase().replace(/\s+/g, '-');
          tag = await Tag.create({
            name: tagName.toLowerCase(),
            slug,
            usageCount: 1,
          });
        } else {
          // Increment usage count
          tag.usageCount += 1;
          await tag.save();
        }
        
        tagIds.push(tag._id);
      }
    }

    // Create question
    const newQuestion = await Question.create({
      title,
      content,
      author: userId,
      tags: tagIds,
      images: images || [],
      views: 0,
      votes: 0,
      upvotedBy: [],
      downvotedBy: [],
      answers: [],
      status: 'open',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Populate the response
    const populatedQuestion = await Question.findById(newQuestion._id)
      .populate('author', 'username avatar reputation')
      .populate('tags', 'name slug icon');

    // Update user's last active time
    await User.findByIdAndUpdate(userId, { lastActiveAt: new Date() });

    return NextResponse.json({
      success: true,
      message: 'Question created successfully',
      question: populatedQuestion,
    }, { status: HTTP_STATUS.CREATED });
  } catch (error: any) {
    console.error('Create question error:', error);
    return errorResponse('Failed to create question', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

// Export handlers with middleware
export const GET = optionalAuth(getQuestionsHandler);
export const POST = authenticate(createQuestionHandler);
