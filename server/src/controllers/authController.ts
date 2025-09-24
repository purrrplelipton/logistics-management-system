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

// Cookie options
const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  domain: process.env.NODE_ENV === 'production' ? process.env.COOKIE_DOMAIN : undefined
});

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

    // Generate token and set cookie
    const token = generateToken((user._id as string).toString());
    res.cookie('auth-token', token, getCookieOptions());

    const response: ApiResponse<{ user: IUser }> = {
      success: true,
      message: 'User registered successfully',
      data: {
        user
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

    // Generate token and set cookie
    const token = generateToken((user._id as string).toString());
    res.cookie('auth-token', token, getCookieOptions());

    // Remove password from response
    const userObject = user.toJSON();

    const response: ApiResponse<{ user: IUser }> = {
      success: true,
      message: 'Login successful',
      data: {
        user: userObject as IUser
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

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    res.clearCookie('auth-token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      domain: process.env.NODE_ENV === 'production' ? process.env.COOKIE_DOMAIN : undefined
    });

    const response: ApiResponse<null> = {
      success: true,
      message: 'Logged out successfully',
      data: null
    };
    
    res.json(response);
  } catch (error) {
    next(error);
  }
};