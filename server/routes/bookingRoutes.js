import express from 'express';
import {
  createBooking,
  getBookings,
  getBookingById,
  cancelBooking,
  approveBooking,
  rejectBooking,
  startBooking,
  completeBooking,
} from '../controllers/bookingController.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(requireAuth);

router.post('/', requireRole('customer'), createBooking);
router.get('/', getBookings);
router.get('/:id', getBookingById);
router.patch('/:id/cancel', cancelBooking);
router.patch('/:id/approve', requireRole('owner', 'admin'), approveBooking);
router.patch('/:id/reject', requireRole('owner', 'admin'), rejectBooking);
router.patch('/:id/start', requireRole('owner', 'customer', 'admin'), startBooking);
router.patch('/:id/complete', requireRole('owner', 'admin'), completeBooking);

export default router;
