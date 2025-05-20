// lib/mongodb.js
import { MongoClient } from 'mongodb';

// Replace with your local MongoDB connection string and database name
// Make sure 'DairyFarm' matches the database name you created in Compass
const uri = "mongodb://localhost:27017/DairyFarm";
const options = {}; // Optional: Add MongoDB connection options here if needed

let client;
let clientPromise;

// Use a global variable so that the client is not re-initialized in hot-reloading
// This prevents multiple connections during development
if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the client is preserved between module reloads
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across modules.
export default clientPromise;
