// src/models/User.ts
import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs'; // Make sure bcryptjs is installed: npm install bcryptjs @types/bcryptjs

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string; // It's optional here because we use `select: false`
  matchPassword: (enteredPassword: string) => Promise<boolean>;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: {
      type: String,
      required: true,
      select: false, // Prevents password from being returned by default queries
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to hash password before saving (for registration/password changes)
UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password!, salt);
  next();
});

// Method to compare entered password with hashed password (for login)
UserSchema.methods.matchPassword = async function (enteredPassword: string): Promise<boolean> {
  // `this.password` might be undefined if `select: false` was used in the query.
  // We need to explicitly `select` the password field when finding the user for login.
  // However, within the model method, `this.password` *should* be available if `findById` or `findOne`
  // with a `.select('+password')` was used.
  if (!this.password) {
      console.error("User password not loaded for comparison.");
      return false; // Or throw an error if this state indicates a critical issue
  }
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;