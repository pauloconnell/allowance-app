import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define MONGODB_URI in your environment variables");
}

let cached = (global as any).mongoose || { conn: null, promise: null };

// Persist cache back to global -for hot reloads/serverless environments
(global as any).mongoose = cached;

export async function connectDB() {
  if (cached.conn) return cached.conn;

//  Ask Mongoose directly if it's already connected 
  // (readyState 1 = connected)
  if (mongoose.connection.readyState === 1) {
    cached.conn = mongoose.connection;
    return cached.conn;
  }
  
  if (!cached.promise) {
    // TypeScript now knows this is a string 
    const uri = MONGODB_URI as string;
    cached.promise = mongoose.connect(uri).then((mongoose) => mongoose);
  }

  try{
    cached.conn = await cached.promise;
    } catch (e) {
    //  If connection fails, clear the promise 
    // so the NEXT attempt can try fresh
    cached.promise = null;
    throw e;
  }
  return cached.conn;
}
