import { Booking } from '../models/index.js';

/**
 * Checks if a vehicle has an overlapping booking.
 * Overlap condition:
 * Existing booking [startA, endA] and Requested booking [startB, endB]
 * Conflict exists when: startA < endB AND endA > startB
 *
 * Only bookings with status 'pending', 'confirmed', or 'active' conflict.
 * 'cancelled' and 'rejected' do NOT block availability.
 */
export const checkBookingConflict = async (vehicleId, startDateTime, endDateTime, excludeBookingId = null) => {
  const reqStart = new Date(startDateTime).getTime();
  const reqEnd = new Date(endDateTime).getTime();

  if (isNaN(reqStart) || isNaN(reqEnd)) {
    throw new Error('Invalid date parameters.');
  }

  if (reqStart >= reqEnd) {
    throw new Error('End date must be after start date.');
  }

  // Find all active/pending/confirmed bookings for this vehicle
  const bookings = await Booking.find({
    vehicle: String(vehicleId),
  });

  const blockingStatuses = ['pending', 'confirmed', 'active'];

  const conflictingBooking = bookings.items.find(b => {
    if (excludeBookingId && String(b._id) === String(excludeBookingId)) {
      return false;
    }

    if (!blockingStatuses.includes(b.bookingStatus)) {
      return false;
    }

    const existStart = new Date(b.startDateTime).getTime();
    const existEnd = new Date(b.endDateTime).getTime();

    // Standard interval overlap condition
    return existStart < reqEnd && existEnd > reqStart;
  });

  return {
    hasConflict: !!conflictingBooking,
    conflictingBooking: conflictingBooking || null,
  };
};
