// src/app/api/income/route.js
import clientPromise from '@/lib/mongodb'; // Import the MongoDB connection utility
import { NextResponse } from 'next/server'; // Import NextResponse for API responses

// GET handler to fetch all income records
export async function GET(request) {
  try {
    // Wait for the MongoDB client promise to resolve
    const client = await clientPromise;
    // Get the database instance using the database name 'DairyFarm'
    const db = client.db("DairyFarm"); // Ensure "DairyFarm" matches your database name

    // Fetch all documents from the 'incomeRecords' collection
    const incomeRecords = await db.collection("incomeRecords").find({}).toArray();

    // Return the fetched income records as a JSON response
    return NextResponse.json(incomeRecords);

  } catch (e) {
    console.error("Error fetching income records:", e);
    // Return an error response
    return NextResponse.json({ message: 'Error fetching income records', error: e.message }, { status: 500 });
  }
}

// POST handler to add a new income record
export async function POST(request) {
  try {
    // Wait for the MongoDB client promise to resolve
    const client = await clientPromise;
    // Get the database instance using the database name 'DairyFarm'
    const db = client.db("DairyFarm"); // Ensure "DairyFarm" matches your database name

    // Parse the request body to get the income data
    const newIncomeData = await request.json();

    // Insert the new income document into the 'incomeRecords' collection
    // MongoDB will automatically add an _id field if not provided
    const result = await db.collection("incomeRecords").insertOne(newIncomeData);

    // Return a success response with the inserted document's ID
    return NextResponse.json({ message: 'Income record added successfully', insertedId: result.insertedId }, { status: 201 }); // 201 Created status

  } catch (e) {
    console.error("Error adding income record:", e);
    // Return an error response
    return NextResponse.json({ message: 'Error adding income record', error: e.message }, { status: 500 });
  }
}
