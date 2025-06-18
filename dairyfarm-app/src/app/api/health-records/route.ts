// src/app/api/health-records/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import HealthRecord, { IHealthRecord } from '@/models/HealthRecord';
import Animal from '@/models/Animal'; // Import Animal model to check ownership
import { getToken } from 'next-auth/jwt'; // For getting the user from the JWT
import { Types } from 'mongoose'; // Import Types for ObjectId validation

const secret = process.env.NEXTAUTH_SECRET;

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const token = await getToken({ req, secret });

    if (!token || !token.uid) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userId = token.uid;

    const body = await req.json();
    const { animal, date, recordType, description, vetName, cost, medications, notes } = body;

    // --- Validation ---
    if (!animal || !date || !recordType || !description) {
      return NextResponse.json({ message: 'Missing required fields: animal, date, recordType, description' }, { status: 400 });
    }

    // Validate animal ID format
    if (!Types.ObjectId.isValid(animal)) {
        return NextResponse.json({ message: 'Invalid animal ID format' }, { status: 400 });
    }

    // Convert date string to Date object
    const recordDate = new Date(date);
    if (isNaN(recordDate.getTime())) {
        return NextResponse.json({ message: 'Invalid date format' }, { status: 400 });
    }

    // Validate animal existence and ownership
    const existingAnimal = await Animal.findById(animal);
    if (!existingAnimal) {
      return NextResponse.json({ message: 'Animal not found' }, { status: 404 });
    }

    // Ensure the user owns the animal they are trying to add a record for
    if (existingAnimal.owner.toString() !== userId) {
      return NextResponse.json({ message: 'Unauthorized: You do not own this animal' }, { status: 403 });
    }

    // Create the new health record
    const newHealthRecord: IHealthRecord = new HealthRecord({
      animal,
      date: recordDate,
      recordType,
      description,
      vetName,
      cost,
      medications,
      notes,
      owner: userId, // Assign the record to the authenticated user
    });

    await newHealthRecord.save();

    return NextResponse.json(newHealthRecord, { status: 201 });
  } catch (error: any) {
    console.error('Error adding health record:', error);
    return NextResponse.json({ message: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
    await dbConnect();

    try {
        const token = await getToken({ req, secret });

        if (!token || !token.uid) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const userId = token.uid;

        // Extract animalId from query parameters if present
        const { searchParams } = new URL(req.url);
        const animalId = searchParams.get('animalId');

        let healthRecords;

        if (animalId) {
            // If animalId is provided, fetch records for that specific animal
            if (!Types.ObjectId.isValid(animalId)) {
                return NextResponse.json({ message: 'Invalid animalId format' }, { status: 400 });
            }

            const existingAnimal = await Animal.findById(animalId);
            if (!existingAnimal) {
                return NextResponse.json({ message: 'Animal not found' }, { status: 404 });
            }
            // Ensure the user owns the animal
            if (existingAnimal.owner.toString() !== userId) {
                return NextResponse.json({ message: 'Unauthorized: You do not own this animal' }, { status: 403 });
            }

            healthRecords = await HealthRecord.find({ animal: animalId, owner: userId })
                .populate('animal', 'name identificationId') // Populate animal name and ID
                .sort({ date: -1 }); // Sort by date descending
        } else {
            // If no animalId, fetch all health records for animals owned by the user
            // First, find all animals owned by the user
            const ownedAnimals = await Animal.find({ owner: userId }).select('_id'); // Get only IDs
            const ownedAnimalIds = ownedAnimals.map(animal => animal._id);

            healthRecords = await HealthRecord.find({
                owner: userId,
                animal: { $in: ownedAnimalIds } // Filter records belonging to owned animals
            })
                .populate('animal', 'name identificationId') // Populate animal name and ID
                .sort({ date: -1 }); // Sort by date descending
        }

        return NextResponse.json(healthRecords, { status: 200 });

    } catch (error: any) {
        console.error('Error fetching health records:', error);
        return NextResponse.json({ message: error.message || 'Internal server error' }, { status: 500 });
    }
}

// NOTE: We don't need a separate GET function for /api/health-records/:id here.
// Next.js App Router handles dynamic routes with a separate file for that.
// For example, GET /api/health-records/SOME_ID would be in src/app/api/health-records/[id]/route.ts
// We'll create that next!