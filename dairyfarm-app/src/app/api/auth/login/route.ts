// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { generateToken } from '@/lib/generateToken';

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const { email, password } = await req.json();

    // Check if user exists AND explicitly select the password field
    const user = await User.findOne({ email }).select('+password'); // <-- CRITICAL CHANGE HERE
    
    if (!user) {
      // It's good practice to return generic messages for security
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    // Now, user.password should be available for matchPassword
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    // Generate token (user._id will always be available)
    const token = generateToken(user._id.toString()); // Convert ObjectId to string for token payload

    return NextResponse.json({
  user: {
    _id: user._id.toString(),
    name: user.name,
    email: user.email,
  },
  token,
}, { status: 200 });

  } catch (error: any) {
    console.error('Login error:', error); // Log the actual error on the server
    return NextResponse.json({ message: 'Server error during login' }, { status: 500 });
  }
}