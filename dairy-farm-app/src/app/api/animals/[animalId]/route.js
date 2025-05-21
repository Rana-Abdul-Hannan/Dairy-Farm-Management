// src/app/api/animals/[animalId]/route.js
import clientPromise from '@/lib/mongodb'; // Import the MongoDB connection utility
import { NextResponse } from 'next/server'; // Import NextResponse for API responses
import { ObjectId } from 'mongodb'; // Import ObjectId to work with MongoDB IDs

// GET handler to fetch a single animal by ID
export async function GET(request, { params }) {
  try {
    const { animalId } = params; // Get the animalId from the dynamic route segment

    // Validate if the animalId is a valid MongoDB ObjectId
    if (!ObjectId.isValid(animalId)) {
      return NextResponse.json({ message: 'Invalid Animal ID format' }, { status: 400 }); // Bad Request
    }

    const client = await clientPromise;
    const db = client.db("DairyFarm"); // Ensure "DairyFarm" matches your database name

    // Find the animal document by its _id
    const animal = await db.collection("animals").findOne({ _id: new ObjectId(animalId) });

    if (!animal) {
      // If no animal is found with that ID
      return NextResponse.json({ message: 'Animal not found' }, { status: 404 }); // Not Found
    }

    // Return the fetched animal as a JSON response
    return NextResponse.json(animal);

  } catch (e) {
    console.error("Error fetching animal by ID:", e);
    // Return an error response
    return NextResponse.json({ message: 'Error fetching animal', error: e.message }, { status: 500 });
  }
}

// PUT handler to update a single animal by ID
export async function PUT(request, { params }) {
  try {
    const { animalId } = params; // Get the animalId from the dynamic route segment

     // Validate if the animalId is a valid MongoDB ObjectId
    if (!ObjectId.isValid(animalId)) {
      return NextResponse.json({ message: 'Invalid Animal ID format' }, { status: 400 }); // Bad Request
    }

    const client = await clientPromise;
    const db = client.db("DairyFarm"); // Ensure "DairyFarm" matches your database name

    // Parse the request body to get the updated animal data
    const updatedAnimalData = await request.json();

    // Update the animal document by its _id
    // Use $set to update only the fields provided in the request body
    const result = await db.collection("animals").updateOne(
      { _id: new ObjectId(animalId) }, // Filter: find the document by ID
      { $set: updatedAnimalData } // Update: set the fields from the request body
    );

    if (result.matchedCount === 0) {
       // If no document was found with the given ID
       return NextResponse.json({ message: 'Animal not found for update' }, { status: 404 }); // Not Found
    }

    // Return a success response
    return NextResponse.json({ message: 'Animal updated successfully', modifiedCount: result.modifiedCount }); // 200 OK is default status

  } catch (e) {
    console.error("Error updating animal:", e);
    // Return an error response
    return NextResponse.json({ message: 'Error updating animal', error: e.message }, { status: 500 });
  }
}

// DELETE handler to delete a single animal by ID
export async function DELETE(request, { params }) {
  try {
    const { animalId } = params; // Get the animalId from the dynamic route segment

    // Validate if the animalId is a valid MongoDB ObjectId
    if (!ObjectId.isValid(animalId)) {
      return NextResponse.json({ message: 'Invalid Animal ID format' }, { status: 400 }); // Bad Request
    }

    const client = await clientPromise;
    const db = client.db("DairyFarm"); // Ensure "DairyFarm" matches your database name

    // Delete the animal document by its _id
    const result = await db.collection("animals").deleteOne({ _id: new ObjectId(animalId) });

    if (result.deletedCount === 0) {
       // If no document was found with the given ID
       return NextResponse.json({ message: 'Animal not found for deletion' }, { status: 404 }); // Not Found
    }

    // Return a success response
    return NextResponse.json({ message: 'Animal deleted successfully', deletedCount: result.deletedCount }); // 200 OK is default status

  } catch (e) {
    console.error("Error deleting animal:", e);
    // Return an error response
    return NextResponse.json({ message: 'Error deleting animal', error: e.message }, { status: 500 });
  }
}
