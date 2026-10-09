import express from 'express';
import {
  getAdminStats,
  getAdminUsers,
  blockUser,
  unblockUser,
  getAdminVehicles,
  approveVehicle,
  rejectVehicle,
  adminCancelBooking,
} from '../controllers/adminController.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(requireAuth, requireRole('admin'));

router.get('/stats', getAdminStats);
router.get('/users', getAdminUsers);
router.patch('/users/:id/block', blockUser);
router.patch('/users/:id/unblock', unblockUser);
router.get('/vehicles', getAdminVehicles);
router.patch('/vehicles/:id/approve', approveVehicle);
router.patch('/vehicles/:id/reject', rejectVehicle);
router.patch('/bookings/:id/cancel', adminCancelBooking);

export default router;
