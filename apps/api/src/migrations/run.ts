import path from 'path';
import fs from 'fs';
import { connectDB } from '../db';
import mongoose from 'mongoose';

const MIGRATIONS_DIR = path.join(__dirname);

const MigrationSchema = new mongoose.Schema({
  name: { type: String, unique: true },
  runAt: { type: Date, default: Date.now },
});
const Migration = mongoose.model('Migration', MigrationSchema);

async function main() {
  await connectDB();
  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => /^\d+_.*\.ts$/.test(f))
    .sort();

  for (const file of files) {
    const already = await Migration.findOne({ name: file });
    if (already) {
      continue;
    }
    const mod = await import(path.join(MIGRATIONS_DIR, file));
    if (typeof mod.up === 'function') {
      await mod.up();
      await Migration.create({ name: file });
    }
  }
  await mongoose.connection.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
