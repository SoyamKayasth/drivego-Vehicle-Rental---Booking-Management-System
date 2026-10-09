import { dbStore, isConnectedToMongo } from '../config/db.js';
import mongoose from 'mongoose';
import {
  userSchema,
  vehicleSchema,
  bookingSchema,
  paymentSchema,
  reviewSchema
} from './schemas.js';

let MongoUser, MongoVehicle, MongoBooking, MongoPayment, MongoReview;

if (mongoose.models && mongoose.models.User) {
  MongoUser = mongoose.models.User;
  MongoVehicle = mongoose.models.Vehicle;
  MongoBooking = mongoose.models.Booking;
  MongoPayment = mongoose.models.Payment;
  MongoReview = mongoose.models.Review;
} else {
  try {
    MongoUser = mongoose.model('User', userSchema);
    MongoVehicle = mongoose.model('Vehicle', vehicleSchema);
    MongoBooking = mongoose.model('Booking', bookingSchema);
    MongoPayment = mongoose.model('Payment', paymentSchema);
    MongoReview = mongoose.model('Review', reviewSchema);
  } catch {
    // If not connected, we still have schemas ready
  }
}

// Helper to generate mongo-like ObjectId string
export const generateId = () => {
  return '65' + Math.random().toString(16).substring(2, 10) + Math.random().toString(16).substring(2, 16);
};

// Custom query wrapper supporting .populate(), .sort(), .limit(), .skip(), .lean()
class QueryWrapper {
  constructor(collectionName, items) {
    this.collectionName = collectionName;
    this.items = Array.isArray(items) ? [...items] : items ? [{ ...items }] : [];
    this.isSingle = !Array.isArray(items);
  }

  sort(sortCriteria) {
    if (this.isSingle || !sortCriteria) return this;
    const entries = Object.entries(sortCriteria);
    this.items.sort((a, b) => {
      for (const [key, dir] of entries) {
        const valA = a[key];
        const valB = b[key];
        if (valA < valB) return dir === -1 ? 1 : -1;
        if (valA > valB) return dir === -1 ? -1 : 1;
      }
      return 0;
    });
    return this;
  }

  skip(n) {
    if (this.isSingle) return this;
    this.items = this.items.slice(n);
    return this;
  }

  limit(n) {
    if (this.isSingle) return this;
    this.items = this.items.slice(0, n);
    return this;
  }

  populate(field, select) {
    const users = dbStore.getCollection('users');
    const vehicles = dbStore.getCollection('vehicles');

    const populateItem = (item) => {
      if (!item) return item;
      const clone = { ...item };
      if (field === 'owner' || field === 'customer') {
        const userId = typeof clone[field] === 'object' ? clone[field]?._id : clone[field];
        const user = users.find(u => u._id === userId || u.id === userId);
        if (user) {
          const safeUser = { ...user };
          delete safeUser.password;
          clone[field] = safeUser;
        }
      } else if (field === 'vehicle') {
        const vehicleId = typeof clone[field] === 'object' ? clone[field]?._id : clone[field];
        const v = vehicles.find(veh => veh._id === vehicleId || veh.id === vehicleId);
        if (v) {
          clone[field] = { ...v };
        }
      }
      return clone;
    };

    if (this.isSingle) {
      this.items = this.items[0] ? [populateItem(this.items[0])] : [];
    } else {
      this.items = this.items.map(populateItem);
    }
    return this;
  }

  lean() {
    return this;
  }

  then(resolve, reject) {
    let result;
    if (this.isSingle) {
      result = this.items[0] ? { ...this.items[0] } : null;
    } else {
      result = this.items.map(i => ({ ...i }));
      result.items = result;
    }

    // Attach resilient populate method to result object/array to prevent any runtime breakage
    if (result) {
      const self = this;
      if (!result.populate) {
        Object.defineProperty(result, 'populate', {
          value: function(field, select) {
            self.populate(field, select);
            return self;
          },
          writable: true,
          configurable: true,
          enumerable: false,
        });
      }
    }

    return Promise.resolve(result).then(resolve, reject);
  }
}

// Unified Store Model Generator
const createStoreModel = (collectionName) => {
  return {
    find(filter = {}) {
      if (isConnectedToMongo && MongoUser) {
        const modelName = collectionName.slice(0, -1).charAt(0).toUpperCase() + collectionName.slice(0, -1).slice(1);
        return mongoose.models[modelName].find(filter);
      }
      const list = dbStore.getCollection(collectionName);
      const filtered = list.filter(item => {
        for (const [k, v] of Object.entries(filter)) {
          if (v && typeof v === 'object' && v.$ne !== undefined) {
            if (item[k] === v.$ne) return false;
          } else if (v && typeof v === 'object' && v.$in !== undefined) {
            if (!v.$in.includes(item[k])) return false;
          } else if (v && typeof v === 'object' && (v.$gte !== undefined || v.$lte !== undefined)) {
            if (v.$gte !== undefined && item[k] < v.$gte) return false;
            if (v.$lte !== undefined && item[k] > v.$lte) return false;
          } else if (v instanceof RegExp) {
            if (!v.test(item[k] || '')) return false;
          } else if (item[k] !== v) {
            return false;
          }
        }
        return true;
      });
      return new QueryWrapper(collectionName, filtered);
    },

    findOne(filter = {}) {
      if (isConnectedToMongo && MongoUser) {
        const modelName = collectionName.slice(0, -1).charAt(0).toUpperCase() + collectionName.slice(0, -1).slice(1);
        return mongoose.models[modelName].findOne(filter);
      }
      const list = dbStore.getCollection(collectionName);
      const found = list.find(item => {
        for (const [k, v] of Object.entries(filter)) {
          if (v && typeof v === 'object' && v.$ne !== undefined) {
            if (item[k] === v.$ne) return false;
          } else if (v instanceof RegExp) {
            if (!v.test(item[k] || '')) return false;
          } else if (item[k] !== v) {
            return false;
          }
        }
        return true;
      });
      return new QueryWrapper(collectionName, found || null);
    },

    findById(id) {
      if (!id) return new QueryWrapper(collectionName, null);
      const cleanId = String(id);
      return this.findOne({ _id: cleanId });
    },

    async create(doc) {
      const now = new Date().toISOString();
      const newDoc = {
        _id: doc._id || generateId(),
        ...doc,
        createdAt: doc.createdAt || now,
        updatedAt: now,
      };
      const list = dbStore.getCollection(collectionName);
      list.unshift(newDoc);
      dbStore.save();
      return { ...newDoc };
    },

    async findByIdAndUpdate(id, update, options = {}) {
      const cleanId = String(id);
      const list = dbStore.getCollection(collectionName);
      const index = list.findIndex(i => String(i._id) === cleanId || String(i.id) === cleanId);
      if (index === -1) return null;

      const current = list[index];
      const updated = {
        ...current,
        ...(update.$set || update),
        updatedAt: new Date().toISOString(),
      };
      list[index] = updated;
      dbStore.save();
      return { ...updated };
    },

    async findByIdAndDelete(id) {
      const cleanId = String(id);
      const list = dbStore.getCollection(collectionName);
      const index = list.findIndex(i => String(i._id) === cleanId || String(i.id) === cleanId);
      if (index === -1) return null;
      const removed = list.splice(index, 1)[0];
      dbStore.save();
      return removed;
    },

    async countDocuments(filter = {}) {
      const results = await this.find(filter);
      return Array.isArray(results.items) ? results.items.length : 0;
    },

    async deleteMany(filter = {}) {
      if (Object.keys(filter).length === 0) {
        dbStore.state[collectionName] = [];
        dbStore.save();
        return { deletedCount: 0 };
      }
      return { deletedCount: 0 };
    }
  };
};

export const User = createStoreModel('users');
export const Vehicle = createStoreModel('vehicles');
export const Booking = createStoreModel('bookings');
export const Payment = createStoreModel('payments');
export const Review = createStoreModel('reviews');
