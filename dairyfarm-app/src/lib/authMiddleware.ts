// src/lib/authMiddleware.ts
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from './dbConnect';
import User, { IUser } from '@/models/User';

// Define the interface for the result of the protection function
export interface AuthResult { // Exporting AuthResult so it can be used by API routes for typing
  isValid: boolean;
  userId?: string; // Only include userId if authentication is successful
  message?: string;
  user?: IUser; // Optional: include full user object if needed by API route
  status: number; // CRITICAL: Add status to the AuthResult
}

// Ensure JWT_SECRET is defined
if (!process.env.JWT_SECRET) {
  throw new Error('Please define the JWT_SECRET environment variable in .env.local');
}

// This function will now return an object indicating success/failure, userId, and HTTP status
export const protectRoute = async (req: NextRequest): Promise<AuthResult> => {
  let token;

  // 1. Check for token in Authorization header
  if (req.headers.has('authorization') && req.headers.get('authorization')?.startsWith('Bearer')) {
    try {
      token = req.headers.get('authorization')?.split(' ')[1]; // Get token from "Bearer <token>"

      if (!token) {
        return { isValid: false, message: 'Not authorized, no token provided', status: 401 };
      }

      // 2. Verify the token
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

      // 3. Find user by ID from token payload
      // dbConnect is called here for robustness, ensuring DB is connected for User.findById
      await dbConnect();
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return { isValid: false, message: 'Not authorized, user not found', status: 401 };
      }

      // 4. Return success with user ID and full user object
      return { isValid: true, userId: user._id.toString(), user: user, status: 200 };

    } catch (error: any) {
      console.error('Auth Error:', error);
      if (error.name === 'TokenExpiredError') {
        return { isValid: false, message: 'Not authorized, token expired', status: 401 };
      }
      if (error.name === 'JsonWebTokenError') {
        return { isValid: false, message: 'Not authorized, invalid token', status: 401 };
      }
      // Generic token failure
      return { isValid: false, message: 'Not authorized, token failed', status: 401 };
    }
  }

  // If no token in header at all
  return { isValid: false, message: 'Not authorized, no token provided in header', status: 401 };
};

// You can add other utility functions here if needed, e.g., generateToken
// export function generateToken(id: string) { ... }