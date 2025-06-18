// src/models/Income.ts
import mongoose, { Document, Schema, Model } from 'mongoose'; // Changed Models to Model

// Define the interface for an Income document
export interface IIncome extends Document {
  source: string;
  amount: number;
  date: Date;
  notes?: string;
  user: mongoose.Types.ObjectId; // Link to the User model
  createdAt: Date;
  updatedAt: Date;
}

// Check if mongoose.models already contains the 'Income' model to prevent redefinition
// This is crucial for Next.js hot-reloading
const IncomeSchema: Schema = new Schema({
  source: {
    type: String,
    required: [true, 'Source is required'],
    trim: true,
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative'],
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
  },
  notes: {
    type: String,
    trim: true,
  },
  // Reference to the User model
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // This should match the name of your User model
    required: true,
  },
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt fields
});

// CORRECTED LINE: Use mongoose.Model<IIncome> for the type assertion
const Income = (mongoose.models.Income || mongoose.model<IIncome>('Income', IncomeSchema)) as mongoose.Model<IIncome>;

export default Income;