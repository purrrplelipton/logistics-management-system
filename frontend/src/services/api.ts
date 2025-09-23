import axios from 'axios';
import { AuthResponse, User, Delivery, ApiResponse } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData: any) => api.post<AuthResponse>('/auth/register', userData),
  login: (credentials: { email: string; password: string }) =>
    api.post<AuthResponse>('/auth/login', credentials),
  getMe: () => api.get<ApiResponse<User>>('/auth/me'),
};

// Users API
export const usersAPI = {
  getUsers: (params?: any) => api.get<ApiResponse<User[]>>('/users', { params }),
  getUserById: (id: string) => api.get<ApiResponse<User>>(`/users/${id}`),
  updateUser: (id: string, userData: any) =>
    api.put<ApiResponse<User>>(`/users/${id}`, userData),
  deleteUser: (id: string) => api.delete(`/users/${id}`),
  getDrivers: () => api.get<ApiResponse<User[]>>('/users/drivers'),
};

// Deliveries API
export const deliveriesAPI = {
  createDelivery: (deliveryData: any) =>
    api.post<ApiResponse<Delivery>>('/deliveries', deliveryData),
  getDeliveries: (params?: any) =>
    api.get<ApiResponse<Delivery[]>>('/deliveries', { params }),
  getDeliveryById: (id: string) =>
    api.get<ApiResponse<Delivery>>(`/deliveries/${id}`),
  assignDriver: (id: string, driverId: string) =>
    api.put<ApiResponse<Delivery>>(`/deliveries/${id}/assign`, { driverId }),
  updateStatus: (id: string, status: string, deliveryNotes?: string) =>
    api.put<ApiResponse<Delivery>>(`/deliveries/${id}/status`, {
      status,
      deliveryNotes,
    }),
  trackDelivery: (trackingNumber: string) =>
    api.get<ApiResponse<any>>(`/deliveries/track/${trackingNumber}`),
};

export default api;