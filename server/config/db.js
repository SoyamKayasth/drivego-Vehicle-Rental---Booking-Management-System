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
  const mongoURI = "mongodb://localhost:27017/drivego";
  if (mongoURI) {
    try {
      await mongoose.connect(mongoURI, {
        serverSelectionTimeoutMS: 2500,
      });
      isConnectedToMongo = true;
      console.log('MongoDB connected successfully via Mongoose.');
      return true;
    } catch (err) {
      console.warn('Live MongoDB connection timed out or failed. Falling back to embedded persistent datastore:', err.message);
      isConnectedToMongo = false;
      return false;
    }
  } else {
    console.log('No MONGO_URI specified. Operating with persistent embedded datastore.');
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
      console.error('Error reading store.json, initializing fresh state:', err);
    }
  }

  save() {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.state, null, 2), 'utf-8');
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
