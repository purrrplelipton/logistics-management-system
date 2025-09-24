import { Router } from 'express';
import {
  getUsers,
  getDrivers,
  getUserById,
  updateUser,
  deactivateUser,
  activateUser
} from '../controllers/userController';
import { authenticate } from '../middleware/auth';
import { validateUserUpdate } from '../middleware/validation';

const router: Router = Router();

// @route   GET /api/users
router.get('/', authenticate, getUsers);

// @route   GET /api/users/drivers
router.get('/drivers', authenticate, getDrivers);

// @route   GET /api/users/:id
router.get('/:id', authenticate, getUserById);

// @route   PUT /api/users/:id
router.put('/:id', authenticate, validateUserUpdate, updateUser);

// @route   DELETE /api/users/:id (Deactivate)
router.delete('/:id', authenticate, deactivateUser);

// @route   PUT /api/users/:id/activate
router.put('/:id/activate', authenticate, activateUser);

export default router;