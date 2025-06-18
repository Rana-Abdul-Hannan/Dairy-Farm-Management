// src/models/HealthRecord.ts
import mongoose, { Schema, Document, Types } from 'mongoose';
import { IAnimal } from './Animal'; // <--- IMPORT IAnimal HERE

// Define the interface for a HealthRecord document
export interface IHealthRecord extends Document {
  animal: Types.ObjectId | IAnimal; // <--- MODIFIED: Can be ObjectId or populated IAnimal
  date: Date;
  recordType: 'Vaccination' | 'Treatment' | 'Diagnosis' | 'Observation' | 'Other';
  description: string;
  vetName?: string; // Optional: Name of the veterinarian
  cost?: number; // Optional: Cost associated with the record
  medications?: string[]; // Optional: List of medications administered
  notes?: string; // Optional: Additional notes
  owner: Types.ObjectId; // Reference to the User who owns this record (and the animal)
  createdAt: Date;
  updatedAt: Date;
}

const HealthRecordSchema: Schema = new Schema(
  {
    animal: {
      type: Schema.Types.ObjectId,
      ref: 'Animal', // Reference to the Animal model
      required: true,
      index: true, // Index for efficient lookup by animal
    },
    date: {
      type: Date,
      required: true,
    },
    recordType: {
      type: String,
      enum: ['Vaccination', 'Treatment', 'Diagnosis', 'Observation', 'Other'],
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    vetName: {
      type: String,
      trim: true,
    },
    cost: {
      type: Number,
    },
    medications: {
      type: [String], // Array of strings
    },
    notes: {
      type: String,
      trim: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User', // Reference to the User model
      required: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt timestamps
  }
);

const HealthRecord = (mongoose.models.HealthRecord ||
  mongoose.model<IHealthRecord>('HealthRecord', HealthRecordSchema)) as mongoose.Model<IHealthRecord>;

export default HealthRecord;