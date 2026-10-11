
import { Booking } from '../models/index.js';

/**
 * Checks if a vehicle has an overlapping booking.
 *
 * Overlap condition:
 * Existing booking [startA, endA]
 * Requested booking [startB, endB]
 *
 * Conflict exists when:
 * startA < endB AND endA > startB
 *
 * Only pending, confirmed, and active bookings block availability.
 */
export const checkBookingConflict = async (
  vehicleId,
  startDateTime,
  endDateTime,
  excludeBookingId = null
) => {
  const reqStart = new Date(startDateTime).getTime();
  const reqEnd = new Date(endDateTime).getTime();

  if (Number.isNaN(reqStart) || Number.isNaN(reqEnd)) {
    throw new Error('Invalid date parameters.');
  }

  if (reqStart >= reqEnd) {
    throw new Error('End date must be after start date.');
  }

  // Fetch bookings for this vehicle.
  const result = await Booking.find({
    vehicle: String(vehicleId),
  });

  // MongoDB returns an array. The local wrapper may expose .items.
  const bookings = Array.isArray(result)
    ? result
    : Array.isArray(result?.items)
      ? result.items
      : [];

  const blockingStatuses = [
    'pending',
    'confirmed',
    'active',
  ];

  const conflictingBooking = bookings.find((booking) => {
    if (
      excludeBookingId &&
      String(booking._id) === String(excludeBookingId)
    ) {
      return false;
    }

    if (!blockingStatuses.includes(booking.bookingStatus)) {
      return false;
    }

    const existingStart = new Date(
      booking.startDateTime
    ).getTime();

    const existingEnd = new Date(
      booking.endDateTime
    ).getTime();

    // Ignore bookings with invalid date data.
    if (
      Number.isNaN(existingStart) ||
      Number.isNaN(existingEnd)
    ) {
      return false;
    }

    // Standard interval-overlap condition.
    return existingStart < reqEnd && existingEnd > reqStart;
  });

  return {
    hasConflict: Boolean(conflictingBooking),
    conflictingBooking: conflictingBooking || null,
  };
};
