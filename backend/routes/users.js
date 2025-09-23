const express = require('express');
const {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getDrivers
} = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');
const { validateUserUpdate } = require('../middleware/validation');

const router = express.Router();

// All routes are protected
router.use(authenticate);

// @route   GET /api/users/drivers
router.get('/drivers', authorize('admin'), getDrivers);

// @route   GET /api/users
router.get('/', authorize('admin'), getUsers);

// @route   GET /api/users/:id
router.get('/:id', authorize('admin'), getUserById);

// @route   PUT /api/users/:id
router.put('/:id', validateUserUpdate, updateUser);

// @route   DELETE /api/users/:id
router.delete('/:id', authorize('admin'), deleteUser);

module.exports = router;