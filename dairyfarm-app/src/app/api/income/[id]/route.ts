// src/app/api/income/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Income from '@/models/Income';
import { protectRoute } from '@/lib/authMiddleware';
import mongoose from 'mongoose';

// Function to handle GET requests (Fetch a single income record by ID)
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  // FIX: Await params here as per the Next.js error message for Route Handlers
  const { id: incomeId } = await params; // This line is changed

  if (!mongoose.Types.ObjectId.isValid(incomeId)) {
    return NextResponse.json({ message: 'Invalid income ID format.' }, { status: 400 });
  }

  const authResult = await protectRoute(req);
  if (!authResult.isValid) {
    return NextResponse.json({ message: authResult.message }, { status: 401 });
  }
  const userId = authResult.userId;

  try {
    const income = await Income.findOne({ _id: incomeId, user: userId });

    if (!income) {
      return NextResponse.json({ message: 'Income record not found or not authorized.' }, { status: 404 });
    }

    return NextResponse.json(income);
  } catch (error: any) {
    console.error('Error fetching single income record:', error);
    return NextResponse.json({ message: error.message || 'Failed to fetch income record' }, { status: 500 });
  }
}

// Function to handle PUT requests (Update an existing income record)
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  // FIX: Await params here as per the Next.js error message for Route Handlers
  const { id: incomeId } = await params; // This line is changed

  // Validate incomeId format early to prevent Mongoose CastError
  if (!mongoose.Types.ObjectId.isValid(incomeId)) {
    return NextResponse.json({ message: 'Invalid income ID format.' }, { status: 400 });
  }

  const authResult = await protectRoute(req);
  if (!authResult.isValid) {
    return NextResponse.json({ message: authResult.message }, { status: 401 });
  }
  const userId = authResult.userId;

  try {
    const body = await req.json();
    const { source, amount, date, notes } = body;

    const updateData: { [key: string]: any } = {};
    if (source !== undefined) updateData.source = source;
    if (amount !== undefined && !isNaN(Number(amount))) updateData.amount = Number(amount);
    if (date !== undefined) updateData.date = new Date(date);
    if (notes !== undefined) updateData.notes = notes;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ message: 'No valid fields provided for update.' }, { status: 400 });
    }

    const updatedIncome = await Income.findOneAndUpdate(
      { _id: incomeId, user: userId },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedIncome) {
      return NextResponse.json({ message: 'Income record not found or not authorized.' }, { status: 404 });
    }

    return NextResponse.json(updatedIncome, { status: 200 });

  } catch (error: any) {
    console.error('Error updating income record:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json({ message: `Validation Error: ${messages.join(', ')}` }, { status: 400 });
    }
    if (error.name === 'CastError') {
      return NextResponse.json({ message: `Invalid data format for field: ${error.path}` }, { status: 400 });
    }
    return NextResponse.json({ message: 'Failed to update income record.', error: error.message }, { status: 500 });
  }
}

// Function to handle DELETE requests (Delete an income record by ID)
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    await dbConnect();
    // FIX: Await params here as per the Next.js error message for Route Handlers
    const { id: incomeId } = await params; // This line is changed

    if (!mongoose.Types.ObjectId.isValid(incomeId)) {
      return NextResponse.json({ message: 'Invalid income ID format.' }, { status: 400 });
    }

    const authResult = await protectRoute(req);
    if (!authResult.isValid) {
      return NextResponse.json({ message: authResult.message }, { status: 401 });
    }
    const userId = authResult.userId;

    try {
      const deletedIncome = await Income.findOneAndDelete({ _id: incomeId, user: userId });

      if (!deletedIncome) {
        return NextResponse.json({ message: 'Income record not found or not authorized.' }, { status: 404 });
      }

      return NextResponse.json({ message: 'Income record deleted successfully.' }, { status: 200 });
    } catch (error: any) {
      console.error('Error deleting income record:', error);
      return NextResponse.json({ message: error.message || 'Failed to delete income record' }, { status: 500 });
    }
}