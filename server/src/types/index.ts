import { Document } from 'mongoose';
import { Request } from 'express';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'customer' | 'driver';
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  isActive: boolean;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country?: string;
}

export interface IPackageDetails {
  description: string;
  weight: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  value?: number;
}

export interface IDelivery extends Document {
  customerId: string;
  driverId?: string;
  pickupAddress: IAddress;
  deliveryAddress: IAddress;
  packageDetails: IPackageDetails;
  status: 'Pending' | 'InTransit' | 'Delivered';
  estimatedDeliveryDate?: Date;
  actualDeliveryDate?: Date;
  deliveryNotes?: string;
  trackingNumber: string;
}

export interface AuthenticatedRequest extends Request {
  user?: IUser;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface JwtPayload {
  id: string;
  iat?: number;
  exp?: number;
}