import { Payment, Booking } from '../models/index.js';

export const processMockPayment = async (req, res, next) => {
  try {
    const customerId = req.user._id || req.user.id;
    const { bookingId, paymentMethod = 'Mock Card', simulateSuccess = true } = req.body;

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: 'bookingId is required.',
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
        message: 'Unauthorized: You can only pay for your own bookings.',
      });
    }

    if (booking.paymentStatus === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'This booking has already been paid for.',
      });
    }

    // Generate simulated transaction ID, e.g., DG-20261008-8F45A21
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randPart = Math.random().toString(36).substring(2, 9).toUpperCase();
    const transactionId = `DG-${dateStr}-${randPart}`;

    const isSuccess = Boolean(simulateSuccess);

    const paymentRecord = await Payment.create({
      booking: booking._id,
      customer: customerId,
      amount: booking.totalAmount,
      paymentMethod,
      transactionId,
      paymentStatus: isSuccess ? 'paid' : 'failed',
      paidAt: new Date().toISOString(),
      refundStatus: 'none',
    });

    // Update booking paymentStatus
    await Booking.findByIdAndUpdate(bookingId, {
      paymentStatus: isSuccess ? 'paid' : 'failed',
    });

    if (!isSuccess) {
      return res.status(400).json({
        success: false,
        message: 'Mock payment failed as simulated. Please retry with valid mock credentials.',
        data: paymentRecord,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Mock payment processed successfully! Booking confirmed with owner pending review.',
      data: {
        payment: paymentRecord,
        bookingId: booking._id,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getPaymentByBooking = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const p = await Payment.findOne({ booking: bookingId });
    const payment = Array.isArray(p.items) ? p.items[0] : p;

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'No payment transaction record found for this booking.',
      });
    }

    res.json({
      success: true,
      data: payment,
    });
  } catch (err) {
    next(err);
  }
};
