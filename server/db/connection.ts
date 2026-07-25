import mongoose from "mongoose";
import session from "express-session";
import MongoStore from "connect-mongo";
import dotenv from "dotenv";

dotenv.config({ path: ['.env.example', '.env'] });

export interface DbStatus {
  isMongoConnected: boolean;
  storeType: "MongoDB" | "MemoryStore (In-Memory Fallback)";
  mongoUrl?: string;
  error?: string;
}

let dbStatus: DbStatus = {
  isMongoConnected: false,
  storeType: "MemoryStore (In-Memory Fallback)",
};

export function getDbStatus(): DbStatus {
  return dbStatus;
}

export async function createSessionStore(): Promise<{
  store: session.Store | undefined;
  status: DbStatus;
}> {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URL;
  console.log("from connect file",mongoUri)

  if (!mongoUri) {
    console.log("ℹ️ MONGODB_URI not provided. Using MemoryStore for express-session (with in-memory pipeline fallback).");
    dbStatus = {
      isMongoConnected: false,
      storeType: "MemoryStore (In-Memory Fallback)",
    };
    return { store: undefined, status: dbStatus };
  }

  try {
    console.log(`⏳ Attempting MongoDB connection to: ${mongoUri.replace(/:[^:@]+@/, ":****@")}`);
    
    // Set connection timeout to 3 seconds so server boot is never stalled
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000,
      connectTimeoutMS: 3000,
    });

    dbStatus = {
      isMongoConnected: true,
      storeType: "MongoDB",
      mongoUrl: mongoUri.replace(/:[^:@]+@/, ":****@"),
    };
    console.log("✅ MongoDB connected successfully! Initializing connect-mongo session store.");

    const mongoStore = MongoStore.create({
      mongoUrl: mongoUri,
      collectionName: "sessions",
      ttl: 24 * 60 * 60, // 1 day
      autoRemove: "native",
    });

    return { store: mongoStore, status: dbStatus };
  } catch (err: any) {
    console.warn(`⚠️ MongoDB Connection Failed (${err.message}). Falling back gracefully to MemoryStore.`);
    console.error(err)
    dbStatus = {
      isMongoConnected: false,
      storeType: "MemoryStore (In-Memory Fallback)",
      error: err.message,
    };
    return { store: undefined, status: dbStatus };
  }
}
