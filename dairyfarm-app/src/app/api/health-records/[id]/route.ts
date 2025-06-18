// src/app/api/health-records/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import HealthRecord, { IHealthRecord } from '@/models/HealthRecord';
import Animal, { IAnimal } from '@/models/Animal';
import { getToken } from 'next-auth/jwt';
import { Types } from 'mongoose'; // For ObjectId validation

const secret = process.env.NEXTAUTH_SECRET;

// GET a single health record by ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();

  try {
    const token = await getToken({ req, secret });

    if (!token || !token.uid) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userId = token.uid;
    const healthRecordId = params.id;

    if (!Types.ObjectId.isValid(healthRecordId)) {
      return NextResponse.json({ message: 'Invalid health record ID format' }, { status: 400 });
    }

    const healthRecord = await HealthRecord.findById(healthRecordId)
      .populate('animal', 'name identificationId owner') as IHealthRecord;

    if (!healthRecord) {
      return NextResponse.json({ message: 'Health record not found' }, { status: 404 });
    }

    // Type guard for healthRecord.animal: Ensure it's a populated object with an 'owner' property
    if (
        typeof healthRecord.animal === 'object' &&
        healthRecord.animal !== null &&
        'owner' in healthRecord.animal
    ) {
        const associatedAnimal = healthRecord.animal as IAnimal;

        // Ensure the retrieved record belongs to an animal owned by the authenticated user
        if (associatedAnimal.owner.toString() !== userId) {
            return NextResponse.json({ message: 'Forbidden: You do not own this health record or its associated animal' }, { status: 403 });
        }
    } else {
        console.error("Health record's associated animal data is incomplete or not populated as expected:", healthRecord.animal);
        return NextResponse.json({ message: 'Internal Server Error: Associated animal data is incomplete for verification.' }, { status: 500 });
    }

    return NextResponse.json(healthRecord, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching health record:', error);
    return NextResponse.json({ message: error.message || 'Internal server error' }, { status: 500 });
  }
}

// UPDATE a health record by ID
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();

  try {
    const token = await getToken({ req, secret });

    if (!token || !token.uid) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userId = token.uid;
    const healthRecordId = params.id;

    if (!Types.ObjectId.isValid(healthRecordId)) {
      return NextResponse.json({ message: 'Invalid health record ID format' }, { status: 400 });
    }

    const body = await req.json();
    const { animal, date, recordType, description, vetName, cost, medications, notes } = body;

    // Find the health record to update
    const healthRecordToUpdate = await HealthRecord.findById(healthRecordId)
      .populate('animal', 'owner') as IHealthRecord;

    if (!healthRecordToUpdate) {
      return NextResponse.json({ message: 'Health record not found' }, { status: 404 });
    }

    let associatedAnimal: IAnimal; // Declare associatedAnimal here

    // Type guard for healthRecordToUpdate.animal: Ensure it's a populated object with an 'owner' property
    if (
        typeof healthRecordToUpdate.animal === 'object' &&
        healthRecordToUpdate.animal !== null &&
        'owner' in healthRecordToUpdate.animal
    ) {
        associatedAnimal = healthRecordToUpdate.animal as IAnimal; // Assign to the declared variable

        // Ensure the user owns this record's associated animal
        if (associatedAnimal.owner.toString() !== userId) {
            return NextResponse.json({ message: 'Forbidden: You do not own this health record or its associated animal' }, { status: 403 });
        }
    } else {
        console.error("Health record's animal reference is not properly populated or missing owner:", healthRecordToUpdate.animal);
        return NextResponse.json({ message: 'Internal Server Error: Associated animal data is incomplete for ownership verification.' }, { status: 500 });
    }


    // Basic validation for required fields if they are being updated to empty values
    if ((typeof date !== 'undefined' && date === null) || (typeof recordType !== 'undefined' && recordType === null) || (typeof description !== 'undefined' && description === null)) {
      return NextResponse.json({ message: 'Required fields cannot be set to null' }, { status: 400 });
    }

    // Prepare update object, handling optional fields and date conversion
    const updateData: Partial<IHealthRecord> = {};
    if (animal !== undefined) {
      if (!Types.ObjectId.isValid(animal)) {
        return NextResponse.json({ message: 'Invalid animal ID format' }, { status: 400 });
      }
      // Additionally, ensure the new 'animal' ID also belongs to the user if it's changing
      // Use the 'associatedAnimal' variable which is already type-guarded
      if (animal.toString() !== String(associatedAnimal._id)) { // <--- FIXED LINE 122
        const newAssociatedAnimal = await Animal.findById(animal);
        if (!newAssociatedAnimal || newAssociatedAnimal.owner.toString() !== userId) {
          return NextResponse.json({ message: 'Forbidden: New associated animal does not belong to you' }, { status: 403 });
        }
      }
      updateData.animal = animal;
    }
    if (date !== undefined) {
        const recordDate = new Date(date);
        if (isNaN(recordDate.getTime())) {
            return NextResponse.json({ message: 'Invalid date format' }, { status: 400 });
        }
        updateData.date = recordDate;
    }
    if (recordType !== undefined) updateData.recordType = recordType;
    if (description !== undefined) updateData.description = description;
    if (vetName !== undefined) updateData.vetName = vetName === '' ? undefined : vetName;
    if (cost !== undefined) updateData.cost = cost === null ? undefined : cost;
    if (medications !== undefined) updateData.medications = medications === null ? undefined : medications;
    if (notes !== undefined) updateData.notes = notes === '' ? undefined : notes;


    const updatedHealthRecord = await HealthRecord.findByIdAndUpdate(
      healthRecordId,
      { $set: updateData }, // Use $set to update only provided fields
      { new: true, runValidators: true } // Return the updated document and run schema validators
    ).populate('animal', 'name identificationId'); // Populate for the response

    if (!updatedHealthRecord) {
      return NextResponse.json({ message: 'Health record not found after update attempt' }, { status: 404 });
    }

    return NextResponse.json(updatedHealthRecord, { status: 200 });
  } catch (error: any) {
    console.error('Error updating health record:', error);
    return NextResponse.json({ message: error.message || 'Internal server error' }, { status: 500 });
  }
}

// DELETE a health record by ID
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();

  try {
    const token = await getToken({ req, secret });

    if (!token || !token.uid) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userId = token.uid;
    const healthRecordId = params.id;

    if (!Types.ObjectId.isValid(healthRecordId)) {
      return NextResponse.json({ message: 'Invalid health record ID format' }, { status: 400 });
    }

    // Find the health record to ensure ownership before deleting
    const healthRecordToDelete = await HealthRecord.findById(healthRecordId)
      .populate('animal', 'owner') as IHealthRecord;

    if (!healthRecordToDelete) {
      return NextResponse.json({ message: 'Health record not found' }, { status: 404 });
    }

    // Type guard for healthRecordToDelete.animal: Ensure it's a populated object with an 'owner' property
    if (
        typeof healthRecordToDelete.animal === 'object' &&
        healthRecordToDelete.animal !== null &&
        'owner' in healthRecordToDelete.animal
    ) {
        const associatedAnimal = healthRecordToDelete.animal as IAnimal;

        // Ensure the user owns this record's associated animal
        if (associatedAnimal.owner.toString() !== userId) {
            return NextResponse.json({ message: 'Forbidden: You do not own this health record or its associated animal' }, { status: 403 });
        }
    } else {
        console.error("Health record's animal reference is not properly populated or missing owner for deletion check:", healthRecordToDelete.animal);
        return NextResponse.json({ message: 'Internal Server Error: Associated animal data is incomplete for ownership verification.' }, { status: 500 });
    }

    await HealthRecord.findByIdAndDelete(healthRecordId);

    return NextResponse.json({ message: 'Health record deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Error deleting health record:', error);
    return NextResponse.json({ message: error.message || 'Internal server error' }, { status: 500 });
  }
}