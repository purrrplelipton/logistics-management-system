export interface User {
  _id: string;
  name: string;
  email: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country?: string;
}

export interface PackageDetails {
  description: string;
  weight: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  value?: number;
}

export interface Delivery {
  _id: string;
  customerId: User;
  driverId?: User;
  pickupAddress: Address;
  deliveryAddress: Address;
  packageDetails: PackageDetails;
  status: 'Pending' | 'InTransit' | 'Delivered';
  estimatedDeliveryDate?: string;
  actualDeliveryDate?: string;
  deliveryNotes?: string;
  trackingNumber: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  errors?: Array<{ msg: string; param?: string; value?: unknown }>;
}

export interface RegisterData {
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
}

export interface DeliveryData {
  pickupAddress: Address;
  deliveryAddress: Address;
  packageDetails: PackageDetails;
  estimatedDeliveryDate?: string;
}

export interface UserParams {
  role?: string;
  page?: number;
  limit?: number;
}

export interface DeliveryParams {
  status?: string;
  customerId?: string;
  driverId?: string;
  page?: number;
  limit?: number;
}