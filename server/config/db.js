import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}


export let isConnectedToMongo = false;

export const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI;
  if (!mongoURI) {
    isConnectedToMongo = false;

    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'MONGO_URI is required in production. Configure it in Render.'
      );
    }

    console.warn(
      'MONGO_URI is missing. Using the local datastore in development.'
    );

    return false;
  }

  try {
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 10000,
    });

    isConnectedToMongo = true;
    console.log('MongoDB connected successfully.');

    return true;
  } catch (err) {
    isConnectedToMongo = false;

    console.error('MongoDB connection failed:', err.message);

    if (process.env.NODE_ENV === 'production') {
      throw err;
    }

    console.warn('Using the local datastore in development.');
    return false;
  }
};

// In-memory + File-backed Persistent Store
class DataStore {
  constructor() {
    this.state = {
      users: [],
      vehicles: [],
      bookings: [],
      payments: [],
      reviews: [],
    };

    this.load();
  }

  load() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        this.state = JSON.parse(raw);
      }
    } catch (err) {
      console.error(
        'Error reading store.json, initializing fresh state:',
        err
      );
    }
  }

  save() {
    try {
      fs.writeFileSync(
        DATA_FILE,
        JSON.stringify(this.state, null, 2),
        'utf-8'
      );
    } catch (err) {
      console.error('Error saving store.json:', err);
    }
  }

  getCollection(name) {
    if (!this.state[name]) {
      this.state[name] = [];
    }

    return this.state[name];
  }
}

export const dbStore = new DataStore();