import { Booking, Vehicle, User, Payment } from '../models/index.js';
import { calculateRentalPrice } from '../utils/priceCalculator.js';
import { checkBookingConflict } from '../utils/conflictChecker.js';

export const createBooking = async (req, res, next) => {
  try {
    const customerId = req.user._id || req.user.id;
    const { vehicleId, rentalType, startDateTime, endDateTime } = req.body;

    if (!vehicleId || !rentalType || !startDateTime || !endDateTime) {
      return res.status(400).json({
        success: false,
        message: 'Please provide vehicleId, rentalType, startDateTime, and endDateTime.',
      });
    }

    const start = new Date(startDateTime);
    const end = new Date(endDateTime);
    const now = new Date();

    // Check valid dates
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format provided.',
      });
    }

    // Start date check (allow a 5 minute grace period for clock drift)
    if (start.getTime() < now.getTime() - (5 * 60 * 1000)) {
      return res.status(400).json({
        success: false,
        message: 'Start date and time cannot be in the past.',
      });
    }

    if (end.getTime() <= start.getTime()) {
      return res.status(400).json({
        success: false,
        message: 'End date and time must be after the start date and time.',
      });
    }

    const vehicleResult = await Vehicle.findById(vehicleId);
    const vehicle = Array.isArray(vehicleResult.items) ? vehicleResult.items[0] : vehicleResult;

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle listing not found.',
      });
    }

    // Rule 1: Only approved vehicles can be booked
    if (vehicle.approvalStatus !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'This vehicle cannot be booked as it is currently pending administrative approval.',
      });
    }

    // Availability status
    if (vehicle.availabilityStatus !== 'available') {
      return res.status(400).json({
        success: false,
        message: `This vehicle is currently ${vehicle.availabilityStatus}.`,
      });
    }

    // Rule 3: Owners cannot book their own vehicles
    if (String(vehicle.owner) === String(customerId)) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle owners are not permitted to book their own listed vehicles.',
      });
    }

    // Rule 7: Booking conflict prevention
    const { hasConflict } = await checkBookingConflict(vehicleId, startDateTime, endDateTime);
    if (hasConflict) {
      return res.status(409).json({
        success: false,
        message: 'Vehicle is already booked for the selected period.',
      });
    }

    // Rule 12: Server-side authoritative price calculation
    const pricing = calculateRentalPrice(vehicle, rentalType, startDateTime, endDateTime);

    const newBooking = await Booking.create({
      customer: customerId,
      owner: vehicle.owner,
      vehicle: vehicle._id,
      rentalType,
      startDateTime: start.toISOString(),
      endDateTime: end.toISOString(),
      duration: pricing.duration,
      baseAmount: pricing.baseAmount,
      securityDeposit: pricing.securityDeposit,
      discount: pricing.discount,
      totalAmount: pricing.totalAmount,
      paymentStatus: 'pending',
      bookingStatus: 'pending',
      cancellationReason: '',
      ownerResponse: '',
    });

    res.status(201).json({
      success: true,
      message: 'Booking request created successfully! Please complete mock payment to proceed.',
      data: newBooking,
    });
  } catch (err) {
    next(err);
  }
};

export const getBookings = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { role } = req.user;
    const { status } = req.query;

    let filter = {};

    if (role === 'customer') {
      filter.customer = userId;
    } else if (role === 'owner') {
      filter.owner = userId;
    }
    // Admin sees all

    if (status) {
      filter.bookingStatus = status;
    }

    const bookings = await Booking.find(filter).populate('vehicle').populate('customer').populate('owner');
    let items = Array.isArray(bookings) ? [...bookings] : bookings?.items ? [...bookings.items] : [];

    // Sort newest first
    items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      success: true,
      total: items.length,
      data: items,
    });
  } catch (err) {
    next(err);
  }
};

export const getBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id || req.user.id;
    const { role } = req.user;

    const populated = await Booking.findById(id).populate('vehicle').populate('customer').populate('owner');
    const item = Array.isArray(populated?.items) ? populated.items[0] : populated;

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.',
      });
    }

    // Authorization: Must be customer, owner, or admin
    const isCustomer = String(item.customer?._id || item.customer) === String(userId);
    const isOwner = String(item.owner?._id || item.owner) === String(userId);

    if (!isCustomer && !isOwner && role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You do not have permission to view this booking.',
      });
    }

    // Check if there is an associated payment
    const payment = await Payment.findOne({ booking: item._id });
    const paymentData = Array.isArray(payment?.items) ? payment.items[0] : payment;

    res.json({
      success: true,
      data: {
        ...item,
        payment: paymentData || null,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id || req.user.id;
    const { reason = 'Cancelled by customer' } = req.body;

    const b = await Booking.findById(id);
    const item = Array.isArray(b.items) ? b.items[0] : b;

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.',
      });
    }

    const isCustomer = String(item.customer) === String(userId);
    const isAdmin = req.user.role === 'admin';

    if (!isCustomer && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Only the customer or an admin can cancel this booking.',
      });
    }

    // Cancellation policy check
    if (item.bookingStatus === 'active') {
      return res.status(400).json({
        success: false,
        message: 'Active rentals cannot be cancelled while in progress.',
      });
    }

    if (item.bookingStatus === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Completed rentals cannot be cancelled.',
      });
    }

    if (item.bookingStatus === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'This booking has already been cancelled.',
      });
    }

    // Check if confirmed booking has already passed start time
    if (item.bookingStatus === 'confirmed') {
      const now = new Date().getTime();
      const start = new Date(item.startDateTime).getTime();
      if (now >= start) {
        return res.status(400).json({
          success: false,
          message: 'Confirmed bookings cannot be cancelled once the rental start time has passed.',
        });
      }
    }

    const updateData = {
      bookingStatus: 'cancelled',
      cancellationReason: reason,
    };

    // If payment was paid, mark refunded
    if (item.paymentStatus === 'paid') {
      updateData.paymentStatus = 'refunded';
      // Also update payment record
      const payment = await Payment.findOne({ booking: item._id });
      const p = Array.isArray(payment.items) ? payment.items[0] : payment;
      if (p) {
        await Payment.findByIdAndUpdate(p._id, { refundStatus: 'refunded' });
      }
    }

    const updated = await Booking.findByIdAndUpdate(id, updateData);

    res.json({
      success: true,
      message: 'Booking cancelled successfully. Any mock payment has been marked as refunded.',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

export const approveBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ownerId = req.user._id || req.user.id;

    const b = await Booking.findById(id);
    const item = Array.isArray(b.items) ? b.items[0] : b;

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.',
      });
    }

    if (String(item.owner) !== String(ownerId) && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You can only approve bookings for your vehicles.',
      });
    }

    if (item.bookingStatus !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot approve a booking that is currently '${item.bookingStatus}'.`,
      });
    }

    const updated = await Booking.findByIdAndUpdate(id, {
      bookingStatus: 'confirmed',
      ownerResponse: 'Approved by vehicle owner.',
    });

    res.json({
      success: true,
      message: 'Booking confirmed successfully!',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

export const rejectBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ownerId = req.user._id || req.user.id;
    const { reason = 'Rejected by vehicle owner' } = req.body;

    const b = await Booking.findById(id);
    const item = Array.isArray(b.items) ? b.items[0] : b;

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.',
      });
    }

    if (String(item.owner) !== String(ownerId) && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You can only reject bookings for your vehicles.',
      });
    }

    if (item.bookingStatus !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot reject a booking with status '${item.bookingStatus}'.`,
      });
    }

    const updateData = {
      bookingStatus: 'rejected',
      ownerResponse: reason,
    };

    if (item.paymentStatus === 'paid') {
      updateData.paymentStatus = 'refunded';
    }

    const updated = await Booking.findByIdAndUpdate(id, updateData);

    res.json({
      success: true,
      message: 'Booking rejected. If paid, simulated refund initiated.',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

export const startBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const b = await Booking.findById(id);
    const item = Array.isArray(b.items) ? b.items[0] : b;

    if (!item) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    if (item.bookingStatus !== 'confirmed') {
      return res.status(400).json({
        success: false,
        message: 'Only confirmed bookings can be marked as active.',
      });
    }

    const updated = await Booking.findByIdAndUpdate(id, {
      bookingStatus: 'active',
    });

    res.json({
      success: true,
      message: 'Rental is now active!',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

export const completeBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id || req.user.id;

    const b = await Booking.findById(id);
    const item = Array.isArray(b.items) ? b.items[0] : b;

    if (!item) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    if (String(item.owner) !== String(userId) && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only the vehicle owner or an administrator can mark a rental as completed.',
      });
    }

    if (item.bookingStatus !== 'active' && item.bookingStatus !== 'confirmed') {
      return res.status(400).json({
        success: false,
        message: 'Only active or confirmed bookings can be completed.',
      });
    }

    const updated = await Booking.findByIdAndUpdate(id, {
      bookingStatus: 'completed',
    });

    res.json({
      success: true,
      message: 'Rental completed and marked as returned! Customer can now submit a review.',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};
