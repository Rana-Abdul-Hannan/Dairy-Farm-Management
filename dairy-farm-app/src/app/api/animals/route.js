// src/app/api/animals/route.js
import clientPromise from '@/lib/mongodb'; // Import the MongoDB connection utility
import { NextResponse } from 'next/server'; // Import NextResponse for API responses

// GET handler to fetch all animals
export async function GET(request) {
  try {
    // Wait for the MongoDB client promise to resolve
    const client = await clientPromise;
    // Get the database instance using the database name 'DairyFarm'
    const db = client.db("DairyFarm"); // Ensure "DairyFarm" matches your database name

    // Fetch all documents from the 'animals' collection
    const animals = await db.collection("animals").find({}).toArray();

    // Return the fetched animals as a JSON response
    return NextResponse.json(animals);

  } catch (e) {
    console.error("Error fetching animals:", e);
    // Return an error response
    return NextResponse.json({ message: 'Error fetching animals', error: e.message }, { status: 500 });
  }
}

// POST handler to add a new animal
export async function POST(request) {
  try {
    // Wait for the MongoDB client promise to resolve
    const client = await clientPromise;
    // Get the database instance using the database name 'DairyFarm'
    const db = client.db("DairyFarm"); // Ensure "DairyFarm" matches your database name

    // Parse the request body to get the animal data
    const newAnimalData = await request.json();

    // Insert the new animal document into the 'animals' collection
    // MongoDB will automatically add an _id field if not provided
    const result = await db.collection("animals").insertOne(newAnimalData);

    // Return a success response with the inserted document's ID
    return NextResponse.json({ message: 'Animal added successfully', insertedId: result.insertedId }, { status: 201 }); // 201 Created status

  } catch (e) {
    console.error("Error adding animal:", e);
    // Return an error response
    return NextResponse.json({ message: 'Error adding animal', error: e.message }, { status: 500 });
  }
}

// You will add PUT (for editing) and DELETE (for deleting) handlers here later
