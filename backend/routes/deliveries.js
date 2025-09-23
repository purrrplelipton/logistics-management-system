const express = require('express');
const {
  createDelivery,
  getDeliveries,
  getDeliveryById,
  assignDriver,
  updateDeliveryStatus,
  trackDelivery
} = require('../controllers/deliveryController');
const { authenticate, authorize } = require('../middleware/auth');
const { validateDelivery, validateStatusUpdate } = require('../middleware/validation');

const router = express.Router();

// Public route for tracking
router.get('/track/:trackingNumber', trackDelivery);

// Protected routes
router.use(authenticate);

// @route   POST /api/deliveries
router.post('/', authorize('customer'), validateDelivery, createDelivery);

// @route   GET /api/deliveries
router.get('/', getDeliveries);

// @route   GET /api/deliveries/:id
router.get('/:id', getDeliveryById);

// @route   PUT /api/deliveries/:id/assign
router.put('/:id/assign', authorize('admin'), assignDriver);

// @route   PUT /api/deliveries/:id/status
router.put('/:id/status', authorize('driver', 'admin'), validateStatusUpdate, updateDeliveryStatus);

module.exports = router;