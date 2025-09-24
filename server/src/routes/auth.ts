import { Router } from 'express';
import { register, login, getMe, logout } from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { validateRegister, validateLogin } from '../middleware/validation';

const router: Router = Router();

// @route   POST /api/auth/register
router.post('/register', validateRegister, register);

// @route   POST /api/auth/login
router.post('/login', validateLogin, login);

// @route   GET /api/auth/me
router.get('/me', authenticate, getMe);

// @route   POST /api/auth/logout
router.post('/logout', authenticate, logout);

export default router;