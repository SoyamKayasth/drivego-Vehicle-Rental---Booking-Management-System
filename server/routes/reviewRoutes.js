import express from 'express';
import { createReview, getVehicleReviews } from '../controllers/reviewController.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/vehicle/:vehicleId', getVehicleReviews);
router.post('/', requireAuth, requireRole('customer'), createReview);

export default router;
