import mongoose from 'mongoose';
import { config } from './env.ts';

let isConnected = false;

export async function connectDB(): Promise<boolean> {
  if (isConnected) {
    return true;
  }

  try {
    const mongoUri = config.mongoUri;
    mongoose.set('strictQuery', true);

    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000,
    });

    isConnected = true;
    console.log(`[Database] MongoDB connected successfully to ${mongoUri}`);
    return true;
  } catch (error: any) {
    console.warn(`[Database] MongoDB connection failed (${error.message}). Mitti2Market operating in high-performance memory fallback mode.`);
    isConnected = false;
    return false;
  }
}

export function isDbConnected(): boolean {
  return isConnected && mongoose.connection.readyState === 1;
}
