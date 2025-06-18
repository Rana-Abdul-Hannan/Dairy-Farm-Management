import mongoose, { Schema, Document } from 'mongoose';

// Define the interface for an Expense document
export interface IExpense extends Document {
  description: string;
  amount: number;
  date: Date;
  category?: string; // Optional field
  notes?: string;   // Optional field
  user: mongoose.Types.ObjectId; // Link to the User model
  createdAt: Date;
  updatedAt: Date;
}

// Define the Mongoose schema for Expense
const ExpenseSchema: Schema = new Schema(
  {
    description: { type: String, required: [true, 'Description is required'], trim: true },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount must be a positive number'],
    },
    date: { type: Date, required: [true, 'Date is required'] },
    category: { type: String, trim: true },
    notes: { type: String, trim: true },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User', // This references your User model
      required: true,
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

// Check if the model already exists to prevent OverwriteModelError
const Expense = mongoose.models.Expense || mongoose.model<IExpense>('Expense', ExpenseSchema);

export default Expense;