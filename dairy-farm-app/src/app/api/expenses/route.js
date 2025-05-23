// src/app/api/expenses/route.js
import clientPromise from '@/lib/mongodb'; // Import the MongoDB connection utility
import { NextResponse } from 'next/server'; // Import NextResponse for API responses

// GET handler to fetch all expense records
export async function GET(request) {
  try {
    // Wait for the MongoDB client promise to resolve
    const client = await clientPromise;
    // Get the database instance using the database name 'DairyFarm'
    const db = client.db("DairyFarm"); // Ensure "DairyFarm" matches your database name

    // Fetch all documents from the 'expenseRecords' collection
    const expenseRecords = await db.collection("expenseRecords").find({}).toArray();

    // Return the fetched expense records as a JSON response
    return NextResponse.json(expenseRecords);

  } catch (e) {
    console.error("Error fetching expense records:", e);
    // Return an error response
    return NextResponse.json({ message: 'Error fetching expense records', error: e.message }, { status: 500 });
  }
}

// POST handler to add a new expense record
export async function POST(request) {
  try {
    // Wait for the MongoDB client promise to resolve
    const client = await clientPromise;
    // Get the database instance using the database name 'DairyFarm'
    const db = client.db("DairyFarm"); // Ensure "DairyFarm" matches your database name

    // Parse the request body to get the expense data
    const newExpenseData = await request.json();

    // Insert the new expense document into the 'expenseRecords' collection
    // MongoDB will automatically add an _id field if not provided
    const result = await db.collection("expenseRecords").insertOne(newExpenseData);

    // Return a success response with the inserted document's ID
    return NextResponse.json({ message: 'Expense record added successfully', insertedId: result.insertedId }, { status: 201 }); // 201 Created status

  } catch (e) {
    console.error("Error adding expense record:", e);
    // Return an error response
    return NextResponse.json({ message: 'Error adding expense record', error: e.message }, { status: 500 });
  }
}
