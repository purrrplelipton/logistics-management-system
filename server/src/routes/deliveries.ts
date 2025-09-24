import { Router } from 'express';
import {
  createDelivery,
  getDeliveries,
  getDeliveryById,
  assignDriver,
  updateDeliveryStatus,
  trackDelivery
} from '../controllers/deliveryController';
import { authenticate } from '../middleware/auth';
import { validateDelivery, validateDeliveryStatus, validateDriverAssignment } from '../middleware/validation';

const router: Router = Router();

// @route   POST /api/deliveries
router.post('/', authenticate, validateDelivery, createDelivery);

// @route   GET /api/deliveries
router.get('/', authenticate, getDeliveries);

// @route   GET /api/deliveries/track/:trackingNumber (Public route)
router.get('/track/:trackingNumber', trackDelivery);

// @route   GET /api/deliveries/:id
router.get('/:id', authenticate, getDeliveryById);

// @route   PUT /api/deliveries/:id/assign
router.put('/:id/assign', authenticate, validateDriverAssignment, assignDriver);

// @route   PUT /api/deliveries/:id/status
router.put('/:id/status', authenticate, validateDeliveryStatus, updateDeliveryStatus);

export default router;