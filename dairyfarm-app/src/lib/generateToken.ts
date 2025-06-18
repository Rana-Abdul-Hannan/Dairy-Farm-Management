// src/lib/generateToken.ts
import jwt from 'jsonwebtoken';

export const generateToken = (id: string): string => { // Make sure 'export const' is here
  return jwt.sign({ id }, process.env.JWT_SECRET!, {
    expiresIn: '1h',
  });
};

export const verifyToken = (token: string) => { // Make sure 'export const' is here
  return jwt.verify(token, process.env.JWT_SECRET!);
};