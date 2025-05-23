// src/app/api/medicine/[recordId]/route.js
import clientPromise from '@/lib/mongodb'; // Import the MongoDB connection utility
import { NextResponse } from 'next/server'; // Import NextResponse for API responses
import { ObjectId } from 'mongodb'; // Import ObjectId to work with MongoDB IDs

// GET handler to fetch a single medicine record by ID
export async function GET(request, { params }) {
  try {
    const { recordId } = params; // Get the recordId from the dynamic route segment

    // Validate if the recordId is a valid MongoDB ObjectId
    if (!ObjectId.isValid(recordId)) {
      return NextResponse.json({ message: 'Invalid Medicine Record ID format' }, { status: 400 }); // Bad Request
    }

    const client = await clientPromise;
    const db = client.db("DairyFarm"); // Ensure "DairyFarm" matches your database name

    // Find the medicine document by its _id in the 'medicineRecords' collection
    const medicineRecord = await db.collection("medicineRecords").findOne({ _id: new ObjectId(recordId) });

    if (!medicineRecord) {
      // If no medicine record is found with that ID
      return NextResponse.json({ message: 'Medicine record not found' }, { status: 404 }); // Not Found
    }

    // Return the fetched medicine record as a JSON response
    return NextResponse.json(medicineRecord);

  } catch (e) {
    console.error("Error fetching medicine record by ID:", e);
    // Return an error response
    return NextResponse.json({ message: 'Error fetching medicine record', error: e.message }, { status: 500 });
  }
}

// PUT handler to update a single medicine record by ID
export async function PUT(request, { params }) {
  try {
    const { recordId } = params; // Get the recordId from the dynamic route segment

     // Validate if the recordId is a valid MongoDB ObjectId
    if (!ObjectId.isValid(recordId)) {
      return NextResponse.json({ message: 'Invalid Medicine Record ID format' }, { status: 400 }); // Bad Request
    }

    const client = await clientPromise;
    const db = client.db("DairyFarm"); // Ensure "DairyFarm" matches your database name

    // Parse the request body to get the updated medicine data
    const updatedMedicineData = await request.json();

    // Update the medicine document by its _id in the 'medicineRecords' collection
    // Use $set to update only the fields provided in the request body
    const result = await db.collection("medicineRecords").updateOne(
      { _id: new ObjectId(recordId) }, // Filter: find the document by ID
      { $set: updatedMedicineData } // Update: set the fields from the request body
    );

    if (result.matchedCount === 0) {
       // If no document was found with the given ID
       return NextResponse.json({ message: 'Medicine record not found for update' }, { status: 404 }); // Not Found
    }

    // Return a success response
    return NextResponse.json({ message: 'Medicine record updated successfully', modifiedCount: result.modifiedCount }); // 200 OK is default status

  } catch (e) {
    console.error("Error updating medicine record:", e);
    // Return an error response
    return NextResponse.json({ message: 'Error updating medicine record', error: e.message }, { status: 500 });
  }
}

// DELETE handler to delete a single medicine record by ID
export async function DELETE(request, { params }) {
  try {
    const { recordId } = params; // Get the recordId from the dynamic route segment

    // Validate if the recordId is a valid MongoDB ObjectId
    if (!ObjectId.isValid(recordId)) {
      return NextResponse.json({ message: 'Invalid Medicine Record ID format' }, { status: 400 }); // Bad Request
    }

    const client = await clientPromise;
    const db = client.db("DairyFarm"); // Ensure "DairyFarm" matches your database name

    // Delete the medicine document by its _id in the 'medicineRecords' collection
    const result = await db.collection("medicineRecords").deleteOne({ _id: new ObjectId(recordId) });

    if (result.deletedCount === 0) {
       // If no document was found with the given ID
       return NextResponse.json({ message: 'Medicine record not found for deletion' }, { status: 404 }); // Not Found
    }

    // Return a success response
    return NextResponse.json({ message: 'Medicine record deleted successfully', deletedCount: result.deletedCount }); // 200 OK is default status

  } catch (e) {
    console.error("Error deleting medicine record:", e);
    // Return an error response
    return NextResponse.json({ message: 'Error deleting medicine record', error: e.message }, { status: 500 });
  }
}
