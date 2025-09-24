import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import User from '../models/User';
import { AuthenticatedRequest, ApiResponse, IUser } from '../types';

// Generate JWT token
const generateToken = (id: string): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  } as jwt.SignOptions);
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
      return;
    }

    const { name, email, password, role, phone, address } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
      return;
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role,
      phone,
      address
    });

    // Generate token
    const token = generateToken((user._id as string).toString());

    const response: ApiResponse<{ user: IUser; token: string }> = {
      success: true,
      message: 'User registered successfully',
      data: {
        user,
        token
      }
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
      return;
    }

    const { email, password } = req.body;

    // Check if user exists and is active
    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.isActive) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials or account disabled'
      });
      return;
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
      return;
    }

    // Generate token
    const token = generateToken((user._id as string).toString());

    // Remove password from response
    const userObject = user.toJSON();

    const response: ApiResponse<{ user: IUser; token: string }> = {
      success: true,
      message: 'Login successful',
      data: {
        user: userObject as IUser,
        token
      }
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    const response: ApiResponse<IUser> = {
      success: true,
      data: req.user
    };
    res.json(response);
  } catch (error) {
    next(error);
  }
};