import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongooseConnect';
import Question from '@/lib/models/Question';
import Answer from '@/lib/models/Answer';
import User from '@/lib/models/User';
import Tag from '@/lib/models/Tag';

export async function GET() {
  try {
    await connectDB();

    // Get counts from database
    const [questionsCount, answersCount, usersCount, tagsCount] = await Promise.all([
      Question.countDocuments(),
      Answer.countDocuments(),
      User.countDocuments(),
      Tag.countDocuments()
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        questions: questionsCount,
        answers: answersCount,
        users: usersCount,
        tags: tagsCount
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch community stats' },
      { status: 500 }
    );
  }
}
