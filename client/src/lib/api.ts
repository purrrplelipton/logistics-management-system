import axios from 'axios';
import { 
  AuthResponse, 
  User, 
  Delivery, 
  ApiResponse, 
  RegisterData, 
  DeliveryData, 
  UserParams, 
  DeliveryParams 
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Enable cookies to be sent with requests
});

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't automatically redirect on 401 errors
    // Let individual components handle authentication state
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData: RegisterData) => api.post<AuthResponse>('/auth/register', userData),
  login: (credentials: { email: string; password: string }) =>
    api.post<AuthResponse>('/auth/login', credentials),
  getMe: () => api.get<ApiResponse<User>>('/auth/me'),
  logout: () => api.post<ApiResponse<null>>('/auth/logout'),
};

// Users API
export const userAPI = {
  getAllUsers: (params?: UserParams) => api.get<ApiResponse<User[]>>('/users', { params }),
  getUserById: (id: string) => api.get<ApiResponse<User>>(`/users/${id}`),
  updateUser: (id: string, userData: Partial<RegisterData>) =>
    api.put<ApiResponse<User>>(`/users/${id}`, userData),
  deleteUser: (id: string) => api.delete(`/users/${id}`),
  getDrivers: () => api.get<ApiResponse<User[]>>('/users/drivers'),
};

// Deliveries API
export const deliveryAPI = {
  createDelivery: (deliveryData: DeliveryData) =>
    api.post<ApiResponse<Delivery>>('/deliveries', deliveryData),
  getAllDeliveries: (params?: DeliveryParams) =>
    api.get<ApiResponse<Delivery[]>>('/deliveries', { params }),
  getDelivery: (id: string) =>
    api.get<ApiResponse<Delivery>>(`/deliveries/${id}`),
  assignDriver: (deliveryId: string, driverId: string) =>
    api.put<ApiResponse<Delivery>>(`/deliveries/${deliveryId}/assign`, { driverId }),
  updateDeliveryStatus: (id: string, data: { status: string; deliveryNotes?: string }) =>
    api.put<ApiResponse<Delivery>>(`/deliveries/${id}/status`, data),
  trackDelivery: (trackingNumber: string) =>
    api.get<ApiResponse<{ trackingNumber: string; status: string; createdAt: string; actualDeliveryDate?: string; estimatedDeliveryDate?: string; deliveryNotes?: string }>>(`/deliveries/track/${trackingNumber}`),
};

export default api;