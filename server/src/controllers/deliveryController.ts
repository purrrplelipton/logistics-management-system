import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import Delivery from '../models/Delivery';
import User from '../models/User';
import { AuthenticatedRequest } from '../types';
import { createId } from '@paralleldrive/cuid2';

// Create a new delivery (Customer only)
export const createDelivery = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
      return;
    }

    const { pickupAddress, deliveryAddress, packageDetails, estimatedDeliveryDate } = req.body;

    // Generate tracking number
    const trackingNumber = `TRK${createId().toUpperCase()}`;

    const delivery = new Delivery({
      customerId: req.user?.id,
      pickupAddress,
      deliveryAddress,
      packageDetails,
      estimatedDeliveryDate,
      trackingNumber,
      status: 'Pending',
    });

    await delivery.save();
    await delivery.populate('customerId', 'name email phone');

    res.status(201).json({
      success: true,
      message: 'Delivery created successfully',
      data: delivery,
    });
  } catch (error) {
    console.error('Create delivery error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error occurred while creating delivery',
    });
  }
};

// Get deliveries with role-based filtering
export const getDeliveries = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};

    // Role-based filtering
    if (req.user?.role === 'customer') {
      filter.customerId = req.user.id;
    } else if (req.user?.role === 'driver') {
      filter.driverId = req.user.id;
    }
    // Admin can see all deliveries (no filter)

    // Additional filters
    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.customerId && req.user?.role === 'admin') {
      filter.customerId = req.query.customerId;
    }

    if (req.query.driverId && req.user?.role === 'admin') {
      filter.driverId = req.query.driverId;
    }

    const deliveries = await Delivery.find(filter)
      .populate('customerId', 'name email phone')
      .populate('driverId', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Delivery.countDocuments(filter);

    res.json({
      success: true,
      data: deliveries,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    console.error('Get deliveries error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error occurred while fetching deliveries',
    });
  }
};

// Get delivery by ID
export const getDeliveryById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const delivery = await Delivery.findById(id)
      .populate('customerId', 'name email phone address')
      .populate('driverId', 'name email phone');

    if (!delivery) {
      res.status(404).json({
        success: false,
        message: 'Delivery not found',
      });
      return;
    }

    // Role-based access control
    if (req.user?.role === 'customer' && delivery.customerId.toString() !== req.user.id) {
      res.status(403).json({
        success: false,
        message: 'Access denied',
      });
      return;
    }

    if (req.user?.role === 'driver' && delivery.driverId?.toString() !== req.user.id) {
      res.status(403).json({
        success: false,
        message: 'Access denied',
      });
      return;
    }

    res.json({
      success: true,
      data: delivery,
    });
  } catch (error) {
    console.error('Get delivery error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error occurred while fetching delivery',
    });
  }
};

// Assign driver to delivery (Admin only)
export const assignDriver = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (req.user?.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required',
      });
      return;
    }

    const { id } = req.params;
    const { driverId } = req.body;

    // Verify driver exists and has driver role
    const driver = await User.findById(driverId);
    if (!driver || driver.role !== 'driver' || !driver.isActive) {
      res.status(400).json({
        success: false,
        message: 'Invalid or inactive driver',
      });
      return;
    }

    const delivery = await Delivery.findById(id);
    if (!delivery) {
      res.status(404).json({
        success: false,
        message: 'Delivery not found',
      });
      return;
    }

    if (delivery.status !== 'Pending') {
      res.status(400).json({
        success: false,
        message: 'Can only assign driver to pending deliveries',
      });
      return;
    }

    delivery.driverId = driverId;
    delivery.status = 'InTransit';
    await delivery.save();

    await delivery.populate([
      { path: 'customerId', select: 'name email phone' },
      { path: 'driverId', select: 'name email phone' },
    ]);

    res.json({
      success: true,
      message: 'Driver assigned successfully',
      data: delivery,
    });
  } catch (error) {
    console.error('Assign driver error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error occurred while assigning driver',
    });
  }
};

// Update delivery status (Driver/Admin only)
export const updateDeliveryStatus = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, deliveryNotes } = req.body;

    const validStatuses = ['Pending', 'InTransit', 'Delivered'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({
        success: false,
        message: 'Invalid status',
      });
      return;
    }

    const delivery = await Delivery.findById(id);
    if (!delivery) {
      res.status(404).json({
        success: false,
        message: 'Delivery not found',
      });
      return;
    }

    // Role-based access control
    if (req.user?.role === 'driver') {
      if (!delivery.driverId || delivery.driverId.toString() !== req.user.id) {
        res.status(403).json({
          success: false,
          message: 'Access denied. Not assigned to this delivery',
        });
        return;
      }
    } else if (req.user?.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Access denied',
      });
      return;
    }

    // Status workflow validation
    const currentStatus = delivery.status;
    const statusOrder = ['Pending', 'InTransit', 'Delivered'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const newIndex = statusOrder.indexOf(status);

    if (newIndex < currentIndex) {
      res.status(400).json({
        success: false,
        message: 'Cannot move delivery backwards in status',
      });
      return;
    }

    delivery.status = status;
    if (deliveryNotes) {
      delivery.deliveryNotes = deliveryNotes;
    }

    if (status === 'Delivered') {
      delivery.actualDeliveryDate = new Date();
    }

    await delivery.save();
    await delivery.populate([
      { path: 'customerId', select: 'name email phone' },
      { path: 'driverId', select: 'name email phone' },
    ]);

    res.json({
      success: true,
      message: 'Delivery status updated successfully',
      data: delivery,
    });
  } catch (error) {
    console.error('Update delivery status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error occurred while updating delivery status',
    });
  }
};

// Track delivery by tracking number (Public endpoint)
export const trackDelivery = async (req: Request, res: Response): Promise<void> => {
  try {
    const { trackingNumber } = req.params;

    const delivery = await Delivery.findOne({ trackingNumber })
      .select(
        'trackingNumber status estimatedDeliveryDate actualDeliveryDate deliveryNotes createdAt pickupAddress deliveryAddress packageDetails',
      )
      .populate('customerId', 'name')
      .populate('driverId', 'name');

    if (!delivery) {
      res.status(404).json({
        success: false,
        message: 'Delivery not found with this tracking number',
      });
      return;
    }

    res.json({
      success: true,
      data: delivery,
    });
  } catch (error) {
    console.error('Track delivery error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error occurred while tracking delivery',
    });
  }
};
