import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Expense from '@/models/Expense'; // Import the new Expense model
import { protectRoute } from '@/lib/authMiddleware';

// Handler for POST requests (Add a new expense)
export async function POST(req: NextRequest) {
  await dbConnect(); // Connect to the database

  const authResult = await protectRoute(req); // Protect the route with authentication
  if (!authResult.isValid) {
    return NextResponse.json({ message: authResult.message }, { status: authResult.status });
  }
  const userId = authResult.userId; // Get the ID of the authenticated user

  try {
    const body = await req.json(); // Parse the request body
    const { description, amount, date, category, notes } = body;

    // Basic validation for required fields
    if (!description || amount === undefined || date === undefined) {
      return NextResponse.json(
        { message: 'Missing required fields: description, amount, and date.' },
        { status: 400 }
      );
    }

    // Create a new expense instance
    const newExpense = new Expense({
      description,
      amount: Number(amount), // Ensure amount is a number
      date: new Date(date),   // Ensure date is a Date object
      category,
      notes,
      user: userId, // Associate the expense with the authenticated user
    });

    await newExpense.save(); // Save the new expense to the database

    // Return the created expense with a 201 Created status
    return NextResponse.json(newExpense, { status: 201 });
  } catch (error: any) {
    console.error('Error adding expense record:', error); // Log any errors

    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json({ message: `Validation Error: ${messages.join(', ')}` }, { status: 400 });
    }
    // Handle Mongoose CastError for invalid data types
    if (error.name === 'CastError') {
        return NextResponse.json({ message: `Invalid data format for field: ${error.path}` }, { status: 400 });
    }
    // Handle other potential server errors
    return NextResponse.json({ message: error.message || 'Failed to add expense record.' }, { status: 500 });
  }
}

// Handler for GET requests (Fetch all expenses for the authenticated user)
export async function GET(req: NextRequest) {
  await dbConnect(); // Connect to the database

  const authResult = await protectRoute(req); // Protect the route with authentication
  if (!authResult.isValid) {
    return NextResponse.json({ message: authResult.message }, { status: authResult.status });
  }
  const userId = authResult.userId; // Get the ID of the authenticated user

  try {
    // Find all expenses associated with the authenticated user, sorted by date (newest first)
    const expenses = await Expense.find({ user: userId }).sort({ date: -1 });

    return NextResponse.json(expenses); // Return the fetched expenses
  } catch (error: any) {
    console.error('Error fetching expense records:', error); // Log any errors
    return NextResponse.json({ message: error.message || 'Failed to fetch expense records' }, { status: 500 });
  }
}