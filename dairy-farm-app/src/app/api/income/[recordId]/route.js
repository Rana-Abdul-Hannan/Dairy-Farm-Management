// src/app/api/income/[recordId]/route.js
import clientPromise from '@/lib/mongodb'; // Import the MongoDB connection utility
import { NextResponse } from 'next/server'; // Import NextResponse for API responses
import { ObjectId } from 'mongodb'; // Import ObjectId to work with MongoDB IDs

// GET handler to fetch a single income record by ID
export async function GET(request, { params }) {
  try {
    const { recordId } = params; // Get the recordId from the dynamic route segment

    // Validate if the recordId is a valid MongoDB ObjectId
    if (!ObjectId.isValid(recordId)) {
      return NextResponse.json({ message: 'Invalid Income Record ID format' }, { status: 400 }); // Bad Request
    }

    const client = await clientPromise;
    const db = client.db("DairyFarm"); // Ensure "DairyFarm" matches your database name

    // Find the income document by its _id in the 'incomeRecords' collection
    const incomeRecord = await db.collection("incomeRecords").findOne({ _id: new ObjectId(recordId) });

    if (!incomeRecord) {
      // If no income record is found with that ID
      return NextResponse.json({ message: 'Income record not found' }, { status: 404 }); // Not Found
    }

    // Return the fetched income record as a JSON response
    return NextResponse.json(incomeRecord);

  } catch (e) {
    console.error("Error fetching income record by ID:", e);
    // Return an error response
    return NextResponse.json({ message: 'Error fetching income record', error: e.message }, { status: 500 });
  }
}

// PUT handler to update a single income record by ID
export async function PUT(request, { params }) {
  try {
    const { recordId } = params; // Get the recordId from the dynamic route segment

     // Validate if the recordId is a valid MongoDB ObjectId
    if (!ObjectId.isValid(recordId)) {
      return NextResponse.json({ message: 'Invalid Income Record ID format' }, { status: 400 }); // Bad Request
    }

    const client = await clientPromise;
    const db = client.db("DairyFarm"); // Ensure "DairyFarm" matches your database name

    // Parse the request body to get the updated income data
    const updatedIncomeData = await request.json();

    // Update the income document by its _id in the 'incomeRecords' collection
    // Use $set to update only the fields provided in the request body
    const result = await db.collection("incomeRecords").updateOne(
      { _id: new ObjectId(recordId) }, // Filter: find the document by ID
      { $set: updatedIncomeData } // Update: set the fields from the request body
    );

    if (result.matchedCount === 0) {
       // If no document was found with the given ID
       return NextResponse.json({ message: 'Income record not found for update' }, { status: 404 }); // Not Found
    }

    // Return a success response
    return NextResponse.json({ message: 'Income record updated successfully', modifiedCount: result.modifiedCount }); // 200 OK is default status
  } catch (e) {
    console.error("Error updating income record:", e);
    // Return an error response
    return NextResponse.json({ message: 'Error updating income record', error: e.message }, { status: 500 });
  }
}

// DELETE handler to delete a single income record by ID
export async function DELETE(request, { params }) {
  try {
    const { recordId } = params; // Get the recordId from the dynamic route segment

    // Validate if the recordId is a valid MongoDB ObjectId
    if (!ObjectId.isValid(recordId)) {
      return NextResponse.json({ message: 'Invalid Income Record ID format' }, { status: 400 }); // Bad Request
    }

    const client = await clientPromise;
    const db = client.db("DairyFarm"); // Ensure "DairyFarm" matches your database name

    // Delete the income document by its _id in the 'incomeRecords' collection
    const result = await db.collection("incomeRecords").deleteOne({ _id: new ObjectId(recordId) });

    if (result.deletedCount === 0) {
       // If no document was found with the given ID
       return NextResponse.json({ message: 'Income record not found for deletion' }, { status: 404 }); // Not Found
    }

    // Return a success response
    return NextResponse.json({ message: 'Income record deleted successfully', deletedCount: result.deletedCount }); // 200 OK is default status

  } catch (e) {
    console.error("Error deleting income record:", e);
    // Return an error response
    return NextResponse.json({ message: 'Error deleting income record', error: e.message }, { status: 500 });
  }
}
