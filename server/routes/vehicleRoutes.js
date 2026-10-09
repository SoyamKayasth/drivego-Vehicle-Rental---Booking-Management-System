import express from 'express';
import {
  getVehicles,
  getVehicleById,
  checkAvailability,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  updateVehicleStatus,
  getOwnerVehicles,
} from '../controllers/vehicleController.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getVehicles);
router.get('/owner/my-listings', requireAuth, requireRole('owner', 'admin'), getOwnerVehicles);
router.get('/:id/availability', checkAvailability);
router.get('/:id', getVehicleById);

// Owner / Admin protected routes
router.post('/', requireAuth, requireRole('owner', 'admin'), createVehicle);
router.put('/:id', requireAuth, requireRole('owner', 'admin'), updateVehicle);
router.delete('/:id', requireAuth, requireRole('owner', 'admin'), deleteVehicle);
router.patch('/:id/status', requireAuth, requireRole('owner', 'admin'), updateVehicleStatus);

export default router;
