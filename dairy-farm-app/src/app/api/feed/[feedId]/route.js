// src/app/api/feed/[feedId]/route.js
import clientPromise from '@/lib/mongodb'; // Import the MongoDB connection utility
import { NextResponse } from 'next/server'; // Import NextResponse for API responses
import { ObjectId } from 'mongodb'; // Import ObjectId to work with MongoDB IDs

// GET handler to fetch a single feed record by ID
export async function GET(request, { params }) {
  try {
    const { feedId } = params; // Get the feedId from the dynamic route segment

    // Validate if the feedId is a valid MongoDB ObjectId
    if (!ObjectId.isValid(feedId)) {
      return NextResponse.json({ message: 'Invalid Feed ID format' }, { status: 400 }); // Bad Request
    }

    const client = await clientPromise;
    const db = client.db("DairyFarm"); // Ensure "DairyFarm" matches your database name

    // Find the feed document by its _id in the 'feedRecords' collection
    const feedRecord = await db.collection("feedRecords").findOne({ _id: new ObjectId(feedId) });

    if (!feedRecord) {
      // If no feed record is found with that ID
      return NextResponse.json({ message: 'Feed record not found' }, { status: 404 }); // Not Found
    }

    // Return the fetched feed record as a JSON response
    return NextResponse.json(feedRecord);

  } catch (e) {
    console.error("Error fetching feed record by ID:", e);
    // Return an error response
    return NextResponse.json({ message: 'Error fetching feed record', error: e.message }, { status: 500 });
  }
}

// PUT handler to update a single feed record by ID
export async function PUT(request, { params }) {
  try {
    const { feedId } = params; // Get the feedId from the dynamic route segment

     // Validate if the feedId is a valid MongoDB ObjectId
    if (!ObjectId.isValid(feedId)) {
      return NextResponse.json({ message: 'Invalid Feed ID format' }, { status: 400 }); // Bad Request
    }

    const client = await clientPromise;
    const db = client.db("DairyFarm"); // Ensure "DairyFarm" matches your database name

    // Parse the request body to get the updated feed data
    const updatedFeedData = await request.json();

    // Update the feed document by its _id in the 'feedRecords' collection
    // Use $set to update only the fields provided in the request body
    const result = await db.collection("feedRecords").updateOne(
      { _id: new ObjectId(feedId) }, // Filter: find the document by ID
      { $set: updatedFeedData } // Update: set the fields from the request body
    );

    if (result.matchedCount === 0) {
       // If no document was found with the given ID
       return NextResponse.json({ message: 'Feed record not found for update' }, { status: 404 }); // Not Found
    }

    // Return a success response
    return NextResponse.json({ message: 'Feed record updated successfully', modifiedCount: result.modifiedCount }); // 200 OK is default status

  } catch (e) {
    console.error("Error updating feed record:", e);
    // Return an error response
    return NextResponse.json({ message: 'Error updating feed record', error: e.message }, { status: 500 });
  }
}

// DELETE handler to delete a single feed record by ID
export async function DELETE(request, { params }) {
  try {
    const { feedId } = params; // Get the feedId from the dynamic route segment

    // Validate if the feedId is a valid MongoDB ObjectId
    if (!ObjectId.isValid(feedId)) {
      return NextResponse.json({ message: 'Invalid Feed ID format' }, { status: 400 }); // Bad Request
    }

    const client = await clientPromise;
    const db = client.db("DairyFarm"); // Ensure "DairyFarm" matches your database name

    // Delete the feed document by its _id in the 'feedRecords' collection
    const result = await db.collection("feedRecords").deleteOne({ _id: new ObjectId(feedId) });

    if (result.deletedCount === 0) {
       // If no document was found with the given ID
       return NextResponse.json({ message: 'Feed record not found for deletion' }, { status: 404 }); // Not Found
    }

    // Return a success response
    return NextResponse.json({ message: 'Feed record deleted successfully', deletedCount: result.deletedCount }); // 200 OK is default status

  } catch (e) {
    console.error("Error deleting feed record:", e);
    // Return an error response
    return NextResponse.json({ message: 'Error deleting feed record', error: e.message }, { status: 500 });
  }
}
