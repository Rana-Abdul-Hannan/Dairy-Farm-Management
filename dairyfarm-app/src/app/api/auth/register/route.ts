// src/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { generateToken } from '@/lib/generateToken';// <-- FIX THIS LINE: Use named import

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const { name, email, password } = await req.json();

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return NextResponse.json({ message: 'User already exists' }, { status: 400 });
    }

    // Create new user
    const user = await User.create({ name, email, password });

    if (user) {
      // Generate token for the newly registered user
      const token = generateToken(user._id);

      return NextResponse.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token,
      }, { status: 201 });
    } else {
      return NextResponse.json({ message: 'Invalid user data' }, { status: 400 });
    }

  } catch (error: any) {
    console.error('Registration error:', error);
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val: any) => val.message);
      return NextResponse.json({ message: messages.join(', ') }, { status: 400 });
    }
    // Handle duplicate key errors (e.g., duplicate email)
    if (error.code === 11000) {
      return NextResponse.json({ message: 'Email is already registered' }, { status: 400 });
    }
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}