// src/app/api/feed/route.js
import clientPromise from '@/lib/mongodb'; // Import the MongoDB connection utility
import { NextResponse } from 'next/server'; // Import NextResponse for API responses

// GET handler to fetch all feed records
export async function GET(request) {
  try {
    // Wait for the MongoDB client promise to resolve
    const client = await clientPromise;
    // Get the database instance using the database name 'DairyFarm'
    const db = client.db("DairyFarm"); // Ensure "DairyFarm" matches your database name

    // Fetch all documents from the 'feedRecords' collection
    const feedRecords = await db.collection("feedRecords").find({}).toArray();

    // Return the fetched feed records as a JSON response
    return NextResponse.json(feedRecords);

  } catch (e) {
    console.error("Error fetching feed records:", e);
    // Return an error response
    return NextResponse.json({ message: 'Error fetching feed records', error: e.message }, { status: 500 });
  }
}

// POST handler to add a new feed record
export async function POST(request) {
  try {
    // Wait for the MongoDB client promise to resolve
    const client = await clientPromise;
    // Get the database instance using the database name 'DairyFarm'
    const db = client.db("DairyFarm"); // Ensure "DairyFarm" matches your database name

    // Parse the request body to get the feed data
    const newFeedData = await request.json();

    // Insert the new feed document into the 'feedRecords' collection
    // MongoDB will automatically add an _id field if not provided
    const result = await db.collection("feedRecords").insertOne(newFeedData);

    // Return a success response with the inserted document's ID
    return NextResponse.json({ message: 'Feed record added successfully', insertedId: result.insertedId }, { status: 201 }); // 201 Created status

  } catch (e) {
    console.error("Error adding feed record:", e);
    // Return an error response
    return NextResponse.json({ message: 'Error adding feed record', error: e.message }, { status: 500 });
  }
}
