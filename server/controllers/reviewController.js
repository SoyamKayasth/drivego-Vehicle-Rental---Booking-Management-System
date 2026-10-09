import { Review, Booking, Vehicle } from '../models/index.js';

export const createReview = async (req, res, next) => {
  try {
    const customerId = req.user._id || req.user.id;
    const { bookingId, rating, comment } = req.body;

    if (!bookingId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'bookingId, rating (1-5), and comment are required.',
      });
    }

    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be an integer or number between 1 and 5.',
      });
    }

    const b = await Booking.findById(bookingId);
    const booking = Array.isArray(b.items) ? b.items[0] : b;

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.',
      });
    }

    if (String(booking.customer) !== String(customerId)) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You can only review vehicles for your own bookings.',
      });
    }

    // Rule 9: Customers can review only completed rentals
    if (booking.bookingStatus !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Reviews can only be submitted for completed rentals after the vehicle has been returned.',
      });
    }

    // Rule 10: A customer cannot review the same completed booking twice
    const existing = await Review.findOne({ booking: bookingId });
    if (existing && (Array.isArray(existing.items) ? existing.items.length > 0 : existing._id)) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a review for this rental booking.',
      });
    }

    const newReview = await Review.create({
      customer: customerId,
      vehicle: booking.vehicle,
      booking: bookingId,
      rating: Math.round(numRating * 10) / 10,
      comment: comment.trim(),
    });

    // Recalculate average rating on the vehicle
    const vehicleReviews = await Review.find({ vehicle: booking.vehicle });
    const allRev = vehicleReviews.items || [];
    const totalScore = allRev.reduce((acc, r) => acc + (r.rating || 5), 0);
    const avgRating = allRev.length > 0 ? (totalScore / allRev.length) : numRating;

    await Vehicle.findByIdAndUpdate(booking.vehicle, {
      rating: parseFloat(avgRating.toFixed(1)),
      numReviews: allRev.length,
    });

    res.status(201).json({
      success: true,
      message: 'Thank you! Your verified review and rating have been posted.',
      data: newReview,
    });
  } catch (err) {
    next(err);
  }
};

export const getVehicleReviews = async (req, res, next) => {
  try {
    const { vehicleId } = req.params;
    const revs = await Review.find({ vehicle: vehicleId }).populate('customer');
    const items = Array.isArray(revs) ? [...revs] : revs?.items ? [...revs.items] : [];
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
