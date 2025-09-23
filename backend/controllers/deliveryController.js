const { validationResult } = require('express-validator');
const Delivery = require('../models/Delivery');
const User = require('../models/User');

// @desc    Create delivery
// @route   POST /api/deliveries
// @access  Private (Customer)
const createDelivery = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const deliveryData = {
      ...req.body,
      customerId: req.user._id
    };

    const delivery = await Delivery.create(deliveryData);
    await delivery.populate('customerId', 'name email phone');

    res.status(201).json({
      success: true,
      message: 'Delivery created successfully',
      data: delivery
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all deliveries
// @route   GET /api/deliveries
// @access  Private (Role-based)
const getDeliveries = async (req, res, next) => {
  try {
    let query = {};
    const { status, page = 1, limit = 10 } = req.query;

    // Role-based filtering
    if (req.user.role === 'customer') {
      query.customerId = req.user._id;
    } else if (req.user.role === 'driver') {
      query.driverId = req.user._id;
    }

    // Status filtering
    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const deliveries = await Delivery.find(query)
      .populate('customerId', 'name email phone')
      .populate('driverId', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Delivery.countDocuments(query);

    res.json({
      success: true,
      data: deliveries,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get delivery by ID
// @route   GET /api/deliveries/:id
// @access  Private
const getDeliveryById = async (req, res, next) => {
  try {
    const delivery = await Delivery.findById(req.params.id)
      .populate('customerId', 'name email phone')
      .populate('driverId', 'name email phone');

    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: 'Delivery not found'
      });
    }

    // Check permissions
    if (req.user.role === 'customer' && delivery.customerId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (req.user.role === 'driver' && delivery.driverId?._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: delivery
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign driver to delivery
// @route   PUT /api/deliveries/:id/assign
// @access  Private (Admin)
const assignDriver = async (req, res, next) => {
  try {
    const { driverId } = req.body;

    // Verify driver exists and has correct role
    const driver = await User.findById(driverId);
    if (!driver || driver.role !== 'driver' || !driver.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Invalid driver'
      });
    }

    const delivery = await Delivery.findById(req.params.id);
    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: 'Delivery not found'
      });
    }

    delivery.driverId = driverId;
    if (delivery.status === 'Pending') {
      delivery.status = 'InTransit';
    }

    await delivery.save();
    await delivery.populate('customerId', 'name email phone');
    await delivery.populate('driverId', 'name email phone');

    res.json({
      success: true,
      message: 'Driver assigned successfully',
      data: delivery
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update delivery status
// @route   PUT /api/deliveries/:id/status
// @access  Private (Driver, Admin)
const updateDeliveryStatus = async (req, res, next) => {
  try {
    const { status, deliveryNotes } = req.body;
    const validStatuses = ['Pending', 'InTransit', 'Delivered'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const delivery = await Delivery.findById(req.params.id);
    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: 'Delivery not found'
      });
    }

    // Check permissions for drivers
    if (req.user.role === 'driver' && delivery.driverId?.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Status workflow enforcement
    if (delivery.status === 'Delivered') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update status of delivered package'
      });
    }

    delivery.status = status;
    if (deliveryNotes) {
      delivery.deliveryNotes = deliveryNotes;
    }

    if (status === 'Delivered') {
      delivery.actualDeliveryDate = new Date();
    }

    await delivery.save();
    await delivery.populate('customerId', 'name email phone');
    await delivery.populate('driverId', 'name email phone');

    res.json({
      success: true,
      message: 'Delivery status updated successfully',
      data: delivery
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Track delivery by tracking number
// @route   GET /api/deliveries/track/:trackingNumber
// @access  Public
const trackDelivery = async (req, res, next) => {
  try {
    const delivery = await Delivery.findOne({ trackingNumber: req.params.trackingNumber })
      .populate('customerId', 'name')
      .select('-__v');

    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: 'Delivery not found with this tracking number'
      });
    }

    res.json({
      success: true,
      data: {
        trackingNumber: delivery.trackingNumber,
        status: delivery.status,
        estimatedDeliveryDate: delivery.estimatedDeliveryDate,
        actualDeliveryDate: delivery.actualDeliveryDate,
        createdAt: delivery.createdAt,
        deliveryNotes: delivery.deliveryNotes
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createDelivery,
  getDeliveries,
  getDeliveryById,
  assignDriver,
  updateDeliveryStatus,
  trackDelivery
};