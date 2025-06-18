// src/app/api/income/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Income from '@/models/Income';
import { protectRoute } from '@/lib/authMiddleware';

export async function POST(req: NextRequest) {
  await dbConnect();

  const authResult = await protectRoute(req);
  if (!authResult.isValid) {
    return NextResponse.json({ message: authResult.message }, { status: authResult.status });
  }
  const userId = authResult.userId;

  try {
    const body = await req.json();
    const { source, amount, date, notes } = body;

    // Basic validation
    if (!source || amount === undefined || date === undefined) {
      return NextResponse.json({ message: 'Missing required fields: source, amount, and date.' }, { status: 400 });
    }

    const newIncome = new Income({
      source,
      amount: Number(amount),
      date: new Date(date),
      notes,
      user: userId, // Associate income with the authenticated user
    });

    await newIncome.save();
    return NextResponse.json(newIncome, { status: 201 }); // 201 Created

  } catch (error: any) {
    console.error('Error adding income record:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json({ message: `Validation Error: ${messages.join(', ')}` }, { status: 400 });
    }
    if (error.name === 'CastError') {
        return NextResponse.json({ message: `Invalid data format for field: ${error.path}` }, { status: 400 });
    }
    return NextResponse.json({ message: error.message || 'Failed to add income record.' }, { status: 500 });
  }
}

// You will also need a GET handler here to fetch all income records for the main list page
export async function GET(req: NextRequest) {
  await dbConnect();

  const authResult = await protectRoute(req);
  if (!authResult.isValid) {
    return NextResponse.json({ message: authResult.message }, { status: authResult.status });
  }
  const userId = authResult.userId;

  try {
    const incomeRecords = await Income.find({ user: userId }).sort({ date: -1 });
    return NextResponse.json(incomeRecords);
  } catch (error: any) {
    console.error('Error fetching income records:', error);
    return NextResponse.json({ message: error.message || 'Failed to fetch income records' }, { status: 500 });
  }
}