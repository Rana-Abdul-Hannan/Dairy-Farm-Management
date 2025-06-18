// src/models/Animal.ts
import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from './User'; // Assuming you have a User model and interface

export interface IAnimal extends Document {
  owner: mongoose.Types.ObjectId | IUser; // Link to the User who owns this animal
  type: 'Cow' | 'Goat' | 'Sheep' | 'Buffalo' | 'Other'; // e.g., Cow, Goat, Sheep, Buffalo
  name: string;
  breed: string;
  gender: 'Male' | 'Female';
  dateOfBirth?: Date;
  identificationId: string; // Unique ID like ear tag, microchip
  notes?: string; // General notes about the animal

  // --- NEW FIELDS ADDED BELOW ---
  weightKg?: number; // Current weight of the animal in kilograms
  healthStatus: 'Healthy' | 'Sick' | 'Injured' | 'Recovering'; // Health status
  lastVetVisit?: Date; // Date of the last veterinary visit
  lastMilking?: Date; // Date of the last milking (if applicable)
  averageMilkProductionLiters?: number; // Average milk production per day (for dairy animals)
  isPregnant?: boolean; // True if female animal is pregnant
  expectedDeliveryDate?: Date; // Expected date for birth
  vaccinations?: { name: string; date: Date; nextDueDate?: Date }[]; // Array of vaccination records
  imageURL?: string; // URL for an animal's photo
  location?: string; // e.g., "Barn 1", "Pasture 3"
  // --- NEW FIELDS END ---

  createdAt: Date;
  updatedAt: Date;
}

const AnimalSchema: Schema = new Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['Cow', 'Goat', 'Sheep', 'Buffalo', 'Other'], // Enforce specific types
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    breed: {
      type: String,
      required: true,
      trim: true,
    },
    gender: {
      type: String,
      required: true,
      enum: ['Male', 'Female'],
    },
    dateOfBirth: {
      type: Date,
    },
    identificationId: {
      type: String,
      required: true,
      unique: true, // Ensure each animal has a unique ID
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    // --- NEW SCHEMA FIELDS ---
    weightKg: {
      type: Number,
      min: 0,
    },
    healthStatus: {
      type: String,
      required: true, // Making this required
      enum: ['Healthy', 'Sick', 'Injured', 'Recovering'],
      default: 'Healthy',
    },
    lastVetVisit: {
      type: Date,
    },
    lastMilking: {
      type: Date,
    },
    averageMilkProductionLiters: {
      type: Number,
      min: 0,
    },
    isPregnant: {
      type: Boolean,
      default: false,
    },
    expectedDeliveryDate: {
      type: Date,
      // Custom validation for expectedDeliveryDate if isPregnant is true
      validate: {
        validator: function (this: IAnimal, v: Date | undefined) {
          return this.isPregnant ? !!v : true; // If pregnant, expectedDeliveryDate must be provided
        },
        message: 'Expected delivery date is required if animal is pregnant.',
      },
    },
    vaccinations: [
      {
        name: { type: String, required: true },
        date: { type: Date, required: true },
        nextDueDate: { type: Date },
      },
    ],
    imageURL: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    // --- NEW SCHEMA FIELDS END ---
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields automatically
  }
);

const Animal = mongoose.models.Animal || mongoose.model<IAnimal>('Animal', AnimalSchema);

export default Animal;