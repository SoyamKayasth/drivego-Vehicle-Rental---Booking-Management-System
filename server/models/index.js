import { dbStore, isConnectedToMongo } from '../config/db.js';
import mongoose from 'mongoose';
import {
  userSchema,
  vehicleSchema,
  bookingSchema,
  paymentSchema,
  reviewSchema
} from './schemas.js';

const MongoUser =
  mongoose.models.User ||
  mongoose.model('User', userSchema);

const MongoVehicle =
  mongoose.models.Vehicle ||
  mongoose.model('Vehicle', vehicleSchema);

const MongoBooking =
  mongoose.models.Booking ||
  mongoose.model('Booking', bookingSchema);

const MongoPayment =
  mongoose.models.Payment ||
  mongoose.model('Payment', paymentSchema);

const MongoReview =
  mongoose.models.Review ||
  mongoose.model('Review', reviewSchema);



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
const createStoreModel = (collectionName, MongoModel) => {
  return {
   find(filter = {}) {
  if (isConnectedToMongo) {
    return MongoModel.find(filter).lean();
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
       if (isConnectedToMongo) {
    return MongoModel.findOne(filter).lean();
      }
      // if (isConnectedToMongo && MongoUser) {
      //   const modelName = collectionName.slice(0, -1).charAt(0).toUpperCase() + collectionName.slice(0, -1).slice(1);
      //   return mongoose.models[modelName].findOne(filter);
      // }
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
  if (!id) return Promise.resolve(null);

  if (isConnectedToMongo) {
    if (!mongoose.isValidObjectId(id)) {
      return Promise.resolve(null);
    }

    return MongoModel.findById(id).lean();
  }

  return this.findOne({ _id: String(id) });
},
    async create(doc) {
        if (isConnectedToMongo) {
    const created = await MongoModel.create(doc);
    return created.toObject();
  }
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
  if (isConnectedToMongo) {
    return MongoModel.findByIdAndUpdate(id, update, {
      ...options,
      new: true,
      runValidators: true,
    }).lean();
  }

  // Keep your existing local update logic here.
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
  if (isConnectedToMongo) {
    return MongoModel.findByIdAndDelete(id).lean();
  }

  // Keep your existing local delete logic here.
        const cleanId = String(id);
      const list = dbStore.getCollection(collectionName);
      const index = list.findIndex(i => String(i._id) === cleanId || String(i.id) === cleanId);
      if (index === -1) return null;
      const removed = list.splice(index, 1)[0];
      dbStore.save();
      return removed;
    },

  async countDocuments(filter = {}) {
  if (isConnectedToMongo) {
    return MongoModel.countDocuments(filter);
  }

  const results = await this.find(filter);

  return Array.isArray(results.items)
    ? results.items.length
    : 0;
},

  async deleteMany(filter = {}) {
  if (isConnectedToMongo) {
    return MongoModel.deleteMany(filter);
  }

  if (Object.keys(filter).length === 0) {
    const deletedCount =
      dbStore.getCollection(collectionName).length;

    dbStore.state[collectionName] = [];
    dbStore.save();

    return { deletedCount };
  }

  return { deletedCount: 0 };
  },
  };
};

export const User = createStoreModel('users', MongoUser);
export const Vehicle = createStoreModel('vehicles', MongoVehicle);
export const Booking = createStoreModel('bookings', MongoBooking);
export const Payment = createStoreModel('payments', MongoPayment);
export const Review = createStoreModel('reviews', MongoReview);
