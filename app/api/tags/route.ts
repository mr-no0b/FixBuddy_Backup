import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongooseConnect';
import { Tag, Question } from '@/lib/models';
import { optionalAuth, AuthRequest } from '@/lib/middleware';
import { errorResponse, HTTP_STATUS } from '@/lib/apiResponse';

// GET /api/tags - Get all tags
async function getTagsHandler(req: AuthRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const sort = searchParams.get('sort') || 'popular'; // popular, name, newest
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search');

    // Build query
    const query: any = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Sort options
    let sortOption: any = { usageCount: -1 }; // Default: most used
    switch (sort) {
      case 'name':
        sortOption = { name: 1 };
        break;
      case 'newest':
        sortOption = { createdAt: -1 };
        break;
    }

    // Get tags
    const tags = await Tag.find(query)
      .sort(sortOption)
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      tags,
      total: tags.length,
    });
  } catch (error: any) {
    console.error('Get tags error:', error);
    return errorResponse('Failed to fetch tags', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

// POST /api/tags - Create a new tag (for future admin use)
async function createTagHandler(req: AuthRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const { name, description, icon } = body;

    // Validate input
    if (!name) {
      return errorResponse('Tag name is required', HTTP_STATUS.BAD_REQUEST);
    }

    // Check if tag already exists
    const existingTag = await Tag.findOne({ name: name.toLowerCase() });
    if (existingTag) {
      return errorResponse('Tag already exists', HTTP_STATUS.CONFLICT);
    }

    // Create slug
    const slug = name.toLowerCase().replace(/\s+/g, '-');

    // Create tag
    const newTag = await Tag.create({
      name: name.toLowerCase(),
      slug,
      description: description || '',
      icon: icon || null,
      usageCount: 0,
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: 'Tag created successfully',
      tag: newTag,
    }, { status: HTTP_STATUS.CREATED });
  } catch (error: any) {
    console.error('Create tag error:', error);
    return errorResponse('Failed to create tag', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

// Export handlers
export const GET = optionalAuth(getTagsHandler);
export const POST = optionalAuth(createTagHandler);
