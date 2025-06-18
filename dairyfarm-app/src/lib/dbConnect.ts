// src/lib/dbConnect.ts
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

// Define an interface for the cached Mongoose connection
interface CachedMongoose {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Extend the NodeJS global object to include our cached connection
declare global {
  var mongoose: CachedMongoose; // Use the interface here
}

// Initialize the cached object, ensuring it's of the correct type
// This line is where the previous type inference issue often originated.
let cached = global.mongoose || (global.mongoose = { conn: null, promise: null });


async function dbConnect() {
  if (cached.conn) {
    console.log('Using existing DB connection');
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    // mongoose.connect returns Promise<typeof mongoose>, which matches CachedMongoose.promise
    cached.promise = mongoose.connect(MONGODB_URI!, opts);
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    // If connection fails, reset the promise to allow retrying
    cached.promise = null; 
    throw e;
  }

  return cached.conn;
}

export default dbConnect;