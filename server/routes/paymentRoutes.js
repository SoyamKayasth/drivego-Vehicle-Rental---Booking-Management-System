import express from 'express';
import { processMockPayment, getPaymentByBooking } from '../controllers/paymentController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(requireAuth);

router.post('/mock', processMockPayment);
router.get('/:bookingId', getPaymentByBooking);

export default router;
