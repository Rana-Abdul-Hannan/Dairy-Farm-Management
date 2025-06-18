// src/app/api/animals/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Animal from '@/models/Animal';
import { verifyToken } from '@/lib/generateToken'; // Named import
import mongoose from 'mongoose'; // Ensure mongoose is imported if used directly (though not strictly needed for this fix)

// GET (Fetch all animals)
export async function GET(request: Request) {
  await dbConnect();
  const token = request.headers.get('authorization')?.split(' ')[1];

  if (!token) {
    return NextResponse.json({ message: 'Unauthorized: No token provided' }, { status: 401 });
  }

  try {
    const decoded = verifyToken(token);
    const userId = (decoded as { id: string }).id;
    // Ensure you're finding animals by the correct field in your schema (e.g., 'owner' not 'userId' directly if different)
    const animals = await Animal.find({ owner: userId }); 
    return NextResponse.json(animals);
  } catch (error: any) {
    console.error('Error fetching animals:', error);
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ message: 'Unauthorized: Invalid token' }, { status: 401 });
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// POST (Add new animal)
export async function POST(request: Request) {
  await dbConnect();
  const token = request.headers.get('authorization')?.split(' ')[1];

  if (!token) {
    return NextResponse.json({ message: 'Unauthorized: No token provided' }, { status: 401 });
  }

  try {
    const decoded = verifyToken(token);
    const userId = (decoded as { id: string }).id; // Extract user ID from the token

    const body = await request.json();

    // Create a new Animal instance, merging the request body with the owner ID
    const newAnimal = new Animal({
      ...body,
      owner: userId, // <-- THIS IS THE CRITICAL ADDITION/CHANGE
    });

    await newAnimal.save();
    return NextResponse.json(newAnimal, { status: 201 });
  } catch (error: any) {
    console.error('Error adding animal:', error);
    if (error.name === 'ValidationError') {
      // Improved error message extraction for validation errors
      const errors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json({ message: `Validation failed: ${errors.join(', ')}` }, { status: 400 });
    }
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ message: 'Unauthorized: Invalid token' }, { status: 401 });
    }
    // Handle duplicate identificationId error (code 11000)
    if (error.code === 11000) {
      return NextResponse.json({ message: 'Identification ID must be unique.' }, { status: 400 });
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}