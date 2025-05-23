// src/app/api/medicine/route.js
import clientPromise from '@/lib/mongodb'; // Import the MongoDB connection utility
import { NextResponse } from 'next/server'; // Import NextResponse for API responses

// GET handler to fetch all medicine records
export async function GET(request) {
  try {
    // Wait for the MongoDB client promise to resolve
    const client = await clientPromise;
    // Get the database instance using the database name 'DairyFarm'
    const db = client.db("DairyFarm"); // Ensure "DairyFarm" matches your database name

    // Fetch all documents from the 'medicineRecords' collection
    const medicineRecords = await db.collection("medicineRecords").find({}).toArray();

    // Return the fetched medicine records as a JSON response
    return NextResponse.json(medicineRecords);

  } catch (e) {
    console.error("Error fetching medicine records:", e);
    // Return an error response
    return NextResponse.json({ message: 'Error fetching medicine records', error: e.message }, { status: 500 });
  }
}

// POST handler to add a new medicine record
export async function POST(request) {
  try {
    // Wait for the MongoDB client promise to resolve
    const client = await clientPromise;
    // Get the database instance using the database name 'DairyFarm'
    const db = client.db("DairyFarm"); // Ensure "DairyFarm" matches your database name

    // Parse the request body to get the medicine data
    const newMedicineData = await request.json();

    // Insert the new medicine document into the 'medicineRecords' collection
    // MongoDB will automatically add an _id field if not provided
    const result = await db.collection("medicineRecords").insertOne(newMedicineData);

    // Return a success response with the inserted document's ID
    return NextResponse.json({ message: 'Medicine record added successfully', insertedId: result.insertedId }, { status: 201 }); // 201 Created status

  } catch (e) {
    console.error("Error adding medicine record:", e);
    // Return an error response
    return NextResponse.json({ message: 'Error adding medicine record', error: e.message }, { status: 500 });
  }
}
