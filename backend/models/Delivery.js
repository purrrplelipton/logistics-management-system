const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Customer ID is required']
  },
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  pickupAddress: {
    street: {
      type: String,
      required: [true, 'Pickup street is required']
    },
    city: {
      type: String,
      required: [true, 'Pickup city is required']
    },
    state: {
      type: String,
      required: [true, 'Pickup state is required']
    },
    zipCode: {
      type: String,
      required: [true, 'Pickup zip code is required']
    },
    country: {
      type: String,
      default: 'USA'
    }
  },
  deliveryAddress: {
    street: {
      type: String,
      required: [true, 'Delivery street is required']
    },
    city: {
      type: String,
      required: [true, 'Delivery city is required']
    },
    state: {
      type: String,
      required: [true, 'Delivery state is required']
    },
    zipCode: {
      type: String,
      required: [true, 'Delivery zip code is required']
    },
    country: {
      type: String,
      default: 'USA'
    }
  },
  packageDetails: {
    description: {
      type: String,
      required: [true, 'Package description is required']
    },
    weight: {
      type: Number,
      required: [true, 'Package weight is required']
    },
    dimensions: {
      length: Number,
      width: Number,
      height: Number
    },
    value: {
      type: Number,
      default: 0
    }
  },
  status: {
    type: String,
    enum: ['Pending', 'InTransit', 'Delivered'],
    default: 'Pending'
  },
  estimatedDeliveryDate: {
    type: Date
  },
  actualDeliveryDate: {
    type: Date
  },
  deliveryNotes: {
    type: String
  },
  trackingNumber: {
    type: String,
    unique: true,
    required: true
  }
}, {
  timestamps: true
});

// Indexes for performance
deliverySchema.index({ status: 1 });
deliverySchema.index({ driverId: 1 });
deliverySchema.index({ customerId: 1 });
deliverySchema.index({ createdAt: -1 });
deliverySchema.index({ trackingNumber: 1 });

// Generate unique tracking number before saving
deliverySchema.pre('save', function(next) {
  if (!this.trackingNumber) {
    this.trackingNumber = 'TRK' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
  }
  next();
});

module.exports = mongoose.model('Delivery', deliverySchema);