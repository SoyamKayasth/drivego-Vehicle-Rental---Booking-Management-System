
import 'dotenv/config';
import mongoose from 'mongoose';
import {
  connectDB,
  isConnectedToMongo,
} from '../config/db.js';
import { seedDatabase } from './seedData.js';

const SEED_KEY = 'drivego-initial-seed-v1';

try {
  await connectDB();

  if (!isConnectedToMongo || !mongoose.connection.db) {
    throw new Error(
      'MongoDB is not connected. Cloud seeding aborted.'
    );
  }

  const metadata = mongoose.connection.db.collection(
    '_app_metadata'
  );

  const alreadySeeded = await metadata.findOne({
    _id: SEED_KEY,
  });

  if (alreadySeeded) {
    console.log(
      'Initial seed already completed. Skipping.'
    );
  } else {
    await seedDatabase();

    await metadata.insertOne({
      _id: SEED_KEY,
      completedAt: new Date(),
    });

    console.log('Initial database seeding completed.');
  }
} catch (error) {
  console.error('Database seeding failed:', error);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
