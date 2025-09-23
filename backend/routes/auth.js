const express = require('express');
const { register, login, getMe } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validateRegister, validateLogin } = require('../middleware/validation');

const router = express.Router();

// @route   POST /api/auth/register
router.post('/register', validateRegister, register);

// @route   POST /api/auth/login
router.post('/login', validateLogin, login);

// @route   GET /api/auth/me
router.get('/me', authenticate, getMe);

module.exports = router;