import mongoose from 'mongoose';

// User Schema
export const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  phone: { type: String, default: '' },
  profileImage: { type: String, default: '' },
  role: { type: String, enum: ['customer', 'owner', 'admin'], default: 'customer' },
  address: { type: String, default: '' },
  city: { type: String, default: '' },
  state: { type: String, default: '' },
  isBlocked: { type: Boolean, default: false },
}, { timestamps: true });

// Vehicle Schema
export const vehicleSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  category: { type: String, enum: ['Car', 'Bike', 'Scooter', 'SUV', 'Van', 'Truck', 'Other'], required: true },
  brand: { type: String, required: true },
  model: { type: String, required: true },
  registrationNumber: { type: String, required: true, unique: true },
  manufacturingYear: { type: Number, required: true },
  fuelType: { type: String, enum: ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG'], required: true },
  transmission: { type: String, enum: ['Manual', 'Automatic'], required: true },
  seatingCapacity: { type: Number, required: true },
  color: { type: String, default: 'Black' },
  location: { type: String, required: true },
  description: { type: String, default: '' },
  features: [{ type: String }],
  images: [{ type: String }],
  hourlyRate: { type: Number, required: true },
  dailyRate: { type: Number, required: true },
  weeklyRate: { type: Number, default: 0 },
  monthlyRate: { type: Number, default: 0 },
  securityDeposit: { type: Number, default: 0 },
  approvalStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  availabilityStatus: { type: String, enum: ['available', 'unavailable', 'maintenance'], default: 'available' },
  rating: { type: Number, default: 4.8 },
  numReviews: { type: Number, default: 0 }
}, { timestamps: true });

// Booking Schema
export const bookingSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  rentalType: { type: String, enum: ['hourly', 'daily', 'weekly', 'monthly'], required: true },
  startDateTime: { type: Date, required: true },
  endDateTime: { type: Date, required: true },
  duration: { type: Number, required: true },
  baseAmount: { type: Number, required: true },
  securityDeposit: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
  bookingStatus: { type: String, enum: ['pending', 'confirmed', 'rejected', 'cancelled', 'active', 'completed'], default: 'pending' },
  cancellationReason: { type: String, default: '' },
  ownerResponse: { type: String, default: '' }
}, { timestamps: true });

// Payment Schema
export const paymentSchema = new mongoose.Schema({
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['Mock Card', 'Mock UPI', 'Mock Cash'], required: true },
  transactionId: { type: String, required: true, unique: true },
  paymentStatus: { type: String, enum: ['paid', 'failed'], required: true },
  paidAt: { type: Date, default: Date.now },
  refundStatus: { type: String, enum: ['none', 'refunded'], default: 'none' }
}, { timestamps: true });

// Review Schema
export const reviewSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true }
}, { timestamps: true });
