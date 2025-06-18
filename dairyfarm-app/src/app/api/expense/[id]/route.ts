import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Expense from '@/models/Expense'; // Import the Expense model
import { protectRoute } from '@/lib/authMiddleware';
import mongoose from 'mongoose'; // Import mongoose for ObjectId validation

// Define the shape of the params object passed to route handlers
interface RouteParams {
  params: {
    id: string; // The expense ID from the URL
  };
}

// Handler for GET requests (Fetch a single expense record by ID)
export async function GET(req: NextRequest, { params }: RouteParams) {
  await dbConnect(); // Connect to the database

  // FIX: Await params here as per the Next.js error message for Route Handlers
  const { id: expenseId } = await params; // Get the ID directly from params

  // Validate expenseId format early to prevent Mongoose CastError
  if (!mongoose.Types.ObjectId.isValid(expenseId)) { // CORRECTED LINE HERE
    return NextResponse.json({ message: 'Invalid expense ID format.' }, { status: 400 });
  }

  const authResult = await protectRoute(req); // Protect the route with authentication
  if (!authResult.isValid) {
    return NextResponse.json({ message: authResult.message }, { status: authResult.status });
  }
  const userId = authResult.userId; // Get the ID of the authenticated user

  try {
    // Find the expense by its ID and ensure it belongs to the authenticated user
    const expense = await Expense.findOne({ _id: expenseId, user: userId });

    if (!expense) {
      return NextResponse.json({ message: 'Expense record not found or not authorized.' }, { status: 404 });
    }

    return NextResponse.json(expense); // Return the fetched expense
  } catch (error: any) {
    console.error('Error fetching single expense record:', error); // Log any errors
    return NextResponse.json({ message: error.message || 'Failed to fetch expense record' }, { status: 500 });
  }
}

// Handler for PUT requests (Update an existing expense record by ID)
export async function PUT(req: NextRequest, { params }: RouteParams) {
  await dbConnect(); // Connect to the database

  // FIX: Await params here as per the Next.js error message for Route Handlers
  const { id: expenseId } = await params; // Get the ID directly from params

  // Validate expenseId format early
  // --- CORRECTED LINE HERE ---
  if (!mongoose.Types.ObjectId.isValid(expenseId)) { // Corrected from isValidObjectId
    return NextResponse.json({ message: 'Invalid expense ID format.' }, { status: 400 });
  }

  const authResult = await protectRoute(req); // Protect the route with authentication
  if (!authResult.isValid) {
    return NextResponse.json({ message: authResult.message }, { status: authResult.status });
  }
  const userId = authResult.userId; // Get the ID of the authenticated user

  try {
    const body = await req.json(); // Parse the request body
    const { description, amount, date, category, notes } = body;

    // Build update object only with provided fields
    const updateData: { [key: string]: any } = {};
    if (description !== undefined) updateData.description = description;
    if (amount !== undefined && !isNaN(Number(amount))) updateData.amount = Number(amount);
    if (date !== undefined) updateData.date = new Date(date);
    if (category !== undefined) updateData.category = category;
    if (notes !== undefined) updateData.notes = notes;

    // If no valid fields are provided for update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ message: 'No valid fields provided for update.' }, { status: 400 });
    }

    // Find and update the expense, ensuring it belongs to the authenticated user
    const updatedExpense = await Expense.findOneAndUpdate(
      { _id: expenseId, user: userId }, // Query by ID and user
      { $set: updateData },             // Set the updated fields
      { new: true, runValidators: true } // Return the updated document and run schema validators
    );

    if (!updatedExpense) {
      return NextResponse.json({ message: 'Expense record not found or not authorized.' }, { status: 404 });
    }

    return NextResponse.json(updatedExpense, { status: 200 }); // Return the updated expense

  } catch (error: any) {
    console.error('Error updating expense record:', error); // Log any errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json({ message: `Validation Error: ${messages.join(', ')}` }, { status: 400 });
    }
    if (error.name === 'CastError') {
      return NextResponse.json({ message: `Invalid data format for field: ${error.path}` }, { status: 400 });
    }
    return NextResponse.json({ message: 'Failed to update expense record.', error: error.message }, { status: 500 });
  }
}

// Handler for DELETE requests (Delete an expense record by ID)
export async function DELETE(req: NextRequest, { params }: RouteParams) {
    await dbConnect(); // Connect to the database

    // FIX: Await params here as per the Next.js error message for Route Handlers
    const { id: expenseId } = await params; // Get the ID directly from params

    // Validate expenseId format early
    if (!mongoose.Types.ObjectId.isValid(expenseId)) { // CORRECTED LINE HERE
      return NextResponse.json({ message: 'Invalid expense ID format.' }, { status: 400 });
    }

    const authResult = await protectRoute(req); // Protect the route with authentication
    if (!authResult.isValid) {
      return NextResponse.json({ message: authResult.message }, { status: authResult.status });
    }
    const userId = authResult.userId; // Get the ID of the authenticated user

    try {
      // Find and delete the expense, ensuring it belongs to the authenticated user
      const deletedExpense = await Expense.findOneAndDelete({ _id: expenseId, user: userId });

      if (!deletedExpense) {
        return NextResponse.json({ message: 'Expense record not found or not authorized.' }, { status: 404 });
      }

      return NextResponse.json({ message: 'Expense record deleted successfully.' }, { status: 200 }); // Confirm deletion
    } catch (error: any) {
      console.error('Error deleting expense record:', error); // Log any errors
      return NextResponse.json({ message: error.message || 'Failed to delete expense record' }, { status: 500 });
    }
}