
import 'dotenv/config';
import mongoose from 'mongoose';

import {
  connectDB,
  isConnectedToMongo,
} from '../config/db.js';

import { Vehicle } from '../models/index.js';

try {
  await connectDB();

  if (!isConnectedToMongo) {
    throw new Error(
      'MongoDB is not connected. Image path migration aborted.'
    );
  }

  const vehicles = await Vehicle.find({});
  let updatedCount = 0;

  for (const vehicle of vehicles) {
    const oldImages = vehicle.images || [];

    const newImages = oldImages.map((image) => {
      if (
        typeof image === 'string' &&
        image.startsWith('/src/assets/images/')
      ) {
        return image.replace(
          '/src/assets/images/',
          '/images/'
        );
      }

      return image;
    });

    if (JSON.stringify(oldImages) !== JSON.stringify(newImages)) {
      await Vehicle.findByIdAndUpdate(vehicle._id, {
        images: newImages,
      });

      updatedCount++;
    }
  }

  console.log(
    `Image paths updated for ${updatedCount} vehicle(s).`
  );
} catch (error) {
  console.error('Image path migration failed:', error);
  process.exitCode = 1;
} finally {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}
