import { connectDB } from './db';
import mongoose from 'mongoose';

async function main() {
  const conn = await connectDB();
  await conn.dropDatabase();
  await mongoose.connection.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
