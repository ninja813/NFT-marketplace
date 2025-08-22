import mongoose from 'mongoose';
import { config } from './config';

export async function connectDB() {
  if (mongoose.connection.readyState !== 0) {
    return mongoose.connection;
  }
  mongoose.set('strictQuery', true);
  await mongoose.connect(config.mongoUri, {
    dbName: config.mongoDbName,
  } as any);
  return mongoose.connection;
}
