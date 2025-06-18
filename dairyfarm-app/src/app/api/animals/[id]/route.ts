import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Animal from '@/models/Animal';
import { verifyToken } from '@/lib/generateToken';
import mongoose from 'mongoose';

// Helper function to extract user ID from token
async function getUserIdFromRequest(req: NextRequest): Promise<string | NextResponse> {
  const token = req.headers.get('Authorization')?.split(' ')[1];

  if (!token) {
    return NextResponse.json({ message: 'Unauthorized: No token provided' }, { status: 401 });
  }

  try {
    const decoded = verifyToken(token);
    return (decoded as { id: string }).id;
  } catch (error: any) {
    console.error('Token verification error:', error);
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ message: 'Unauthorized: Invalid token' }, { status: 401 });
    }
    return NextResponse.json({ message: 'Internal server error during authentication' }, { status: 500 });
  }
}

// GET /api/animals/:id
export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  await dbConnect();

  const userIdOrResponse = await getUserIdFromRequest(req);
  if (typeof userIdOrResponse !== 'string') return userIdOrResponse;
  const userId = userIdOrResponse;

  const { id } = await context.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid animal ID format' }, { status: 400 });
    }

    const animal = await Animal.findOne({ _id: id, owner: userId });

    if (!animal) {
      return NextResponse.json({ message: 'Animal not found or not owned by user' }, { status: 404 });
    }

    return NextResponse.json(animal, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching animal:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

// PUT /api/animals/:id
export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  await dbConnect();

  const userIdOrResponse = await getUserIdFromRequest(req);
  if (typeof userIdOrResponse !== 'string') return userIdOrResponse;
  const userId = userIdOrResponse;

  const { id } = await context.params;

  try {
    const body = await req.json();

    const {
      type, name, breed, gender, dateOfBirth, identificationId, notes,
      weightKg, healthStatus, lastVetVisit, lastMilking, averageMilkProductionLiters,
      isPregnant, expectedDeliveryDate, vaccinations, imageURL, location
    } = body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid animal ID format' }, { status: 400 });
    }

    let animal = await Animal.findOne({ _id: id, owner: userId });

    if (!animal) {
      return NextResponse.json({ message: 'Animal not found or not owned by user' }, { status: 404 });
    }

    // Conditionally update fields
    if (type !== undefined) animal.type = type;
    if (name !== undefined) animal.name = name;
    if (breed !== undefined) animal.breed = breed;
    if (gender !== undefined) animal.gender = gender;
    if (dateOfBirth !== undefined) animal.dateOfBirth = dateOfBirth;
    if (identificationId !== undefined) animal.identificationId = identificationId;
    if (notes !== undefined) animal.notes = notes;
    if (weightKg !== undefined) animal.weightKg = weightKg;
    if (healthStatus !== undefined) animal.healthStatus = healthStatus;
    if (lastVetVisit !== undefined) animal.lastVetVisit = lastVetVisit;
    if (lastMilking !== undefined) animal.lastMilking = lastMilking;
    if (averageMilkProductionLiters !== undefined) animal.averageMilkProductionLiters = averageMilkProductionLiters;
    if (isPregnant !== undefined) animal.isPregnant = isPregnant;
    if (expectedDeliveryDate !== undefined) animal.expectedDeliveryDate = expectedDeliveryDate;
    if (vaccinations !== undefined) animal.vaccinations = vaccinations;
    if (imageURL !== undefined) animal.imageURL = imageURL;
    if (location !== undefined) animal.location = location;

    await animal.save();

    return NextResponse.json(animal, { status: 200 });
  } catch (error: any) {
    console.error('Error updating animal:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val: any) => val.message);
      return NextResponse.json({ message: `Validation failed: ${messages.join(', ')}` }, { status: 400 });
    }
    if (error.code === 11000) {
      return NextResponse.json({ message: 'Identification ID must be unique.' }, { status: 400 });
    }
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

// DELETE /api/animals/:id
export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  await dbConnect();

  const userIdOrResponse = await getUserIdFromRequest(req);
  if (typeof userIdOrResponse !== 'string') return userIdOrResponse;
  const userId = userIdOrResponse;

  const { id } = await context.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid animal ID format' }, { status: 400 });
    }

    const result = await Animal.deleteOne({ _id: id, owner: userId });

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: 'Animal not found or not owned by user' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Animal removed successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Error deleting animal:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
