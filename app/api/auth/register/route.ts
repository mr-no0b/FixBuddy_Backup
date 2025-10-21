import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongooseConnect';
import User from '@/lib/models/User';
import { hashPassword, generateToken, isValidEmail, isValidPassword, isValidUsername } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const { username, email, password } = body;

    // Validate input
    if (!username || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate username
    if (!isValidUsername(username)) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Username must be 3-30 characters and contain only letters, numbers, and underscores' 
        },
        { status: 400 }
      );
    }

    // Validate email
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { success: false, message: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password
    if (!isValidPassword(password)) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username }]
    });

    if (existingUser) {
      const field = existingUser.email === email.toLowerCase() ? 'Email' : 'Username';
      return NextResponse.json(
        { success: false, message: `${field} already exists` },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create new user
    const newUser = await User.create({
      username,
      email: email.toLowerCase(),
      passwordHash,
      reputation: 0,
      createdAt: new Date(),
      lastActiveAt: new Date(),
    });

    // Generate JWT token
    const token = generateToken({
      userId: (newUser._id as any).toString(),
      email: newUser.email,
      username: newUser.username,
    });

    // Create response with cookie
    const response = NextResponse.json(
      {
        success: true,
        message: 'User registered successfully',
        user: {
          _id: newUser._id,
          username: newUser.username,
          email: newUser.email,
          reputation: newUser.reputation,
          avatar: newUser.avatar,
        },
        token,
      },
      { status: 201 }
    );

    // Set cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Register error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error during registration' },
      { status: 500 }
    );
  }
}
