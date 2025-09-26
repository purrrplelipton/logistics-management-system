import { body } from 'express-validator';
import zxcvbn from 'zxcvbn';

// User registration validation
export const validateRegister = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),

  body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),

  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .custom((value, { req }) => {
      const comparisonInputs = [req.body?.email, req.body?.name].filter((input): input is string =>
        Boolean(input),
      );
      const { score } = zxcvbn(value, comparisonInputs);

      if (score >= 2) {
        return true;
      }

      throw new Error(
        'Password strength must be rated okay or strong. Try adding length, numbers, and symbols.',
      );
    }),

  body('role')
    .isIn(['admin', 'customer', 'driver'])
    .withMessage('Role must be admin, customer, or driver'),

  body('phone')
    .optional()
    .matches(/^\+?[\d\s\-()]+$/)
    .withMessage('Please provide a valid phone number'),
];

// User login validation
export const validateLogin = [
  body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),

  body('password').notEmpty().withMessage('Password is required'),
];

// Delivery creation validation
export const validateDelivery = [
  body('pickupAddress.street').notEmpty().withMessage('Pickup street is required'),

  body('pickupAddress.city').notEmpty().withMessage('Pickup city is required'),

  body('pickupAddress.state').notEmpty().withMessage('Pickup state is required'),

  body('pickupAddress.zipCode').notEmpty().withMessage('Pickup zip code is required'),

  body('deliveryAddress.street').notEmpty().withMessage('Delivery street is required'),

  body('deliveryAddress.city').notEmpty().withMessage('Delivery city is required'),

  body('deliveryAddress.state').notEmpty().withMessage('Delivery state is required'),

  body('deliveryAddress.zipCode').notEmpty().withMessage('Delivery zip code is required'),

  body('packageDetails.description')
    .notEmpty()
    .withMessage('Package description is required')
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),

  body('packageDetails.weight')
    .isNumeric()
    .withMessage('Weight must be a number')
    .isFloat({ min: 0.1 })
    .withMessage('Weight must be greater than 0'),

  body('packageDetails.value')
    .optional()
    .isNumeric()
    .withMessage('Value must be a number')
    .isFloat({ min: 0 })
    .withMessage('Value must be non-negative'),

  body('estimatedDeliveryDate').optional().isISO8601().withMessage('Invalid date format'),
];

// User update validation
export const validateUserUpdate = [
  body('name')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),

  body('email').optional().isEmail().withMessage('Please provide a valid email').normalizeEmail(),

  body('phone')
    .optional()
    .matches(/^\+?[\d\s\-()]+$/)
    .withMessage('Please provide a valid phone number'),

  body('role')
    .optional()
    .isIn(['admin', 'customer', 'driver'])
    .withMessage('Role must be admin, customer, or driver'),
];

// Status update validation
export const validateDeliveryStatus = [
  body('status')
    .isIn(['Pending', 'InTransit', 'Delivered'])
    .withMessage('Status must be Pending, InTransit, or Delivered'),

  body('deliveryNotes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Delivery notes must not exceed 1000 characters'),
];

// Driver assignment validation
export const validateDriverAssignment = [
  body('driverId')
    .notEmpty()
    .withMessage('Driver ID is required')
    .isMongoId()
    .withMessage('Invalid driver ID format'),
];
