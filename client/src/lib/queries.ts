import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { deliveryAPI, userAPI } from './api';
import { Delivery, User } from '@/types';

// Query keys
export const queryKeys = {
  deliveries: {
    all: ['deliveries'] as const,
    byStatus: (status: string) => ['deliveries', 'status', status] as const,
    byId: (id: string) => ['deliveries', id] as const,
    byCustomer: (customerId: string) => ['deliveries', 'customer', customerId] as const,
    byDriver: (driverId: string) => ['deliveries', 'driver', driverId] as const,
  },
  users: {
    all: ['users'] as const,
    drivers: ['users', 'drivers'] as const,
    byId: (id: string) => ['users', id] as const,
  },
};

// Delivery queries
export const useDeliveries = () => {
  return useQuery({
    queryKey: queryKeys.deliveries.all,
    queryFn: async () => {
      const response = await deliveryAPI.getAllDeliveries();
      return response.data.data as Delivery[];
    },
  });
};

export const useDeliveriesByStatus = (status: string) => {
  return useQuery({
    queryKey: queryKeys.deliveries.byStatus(status),
    queryFn: async () => {
      const response = await deliveryAPI.getAllDeliveries({ status });
      return response.data.data as Delivery[];
    },
    enabled: !!status,
  });
};

export const useDelivery = (id: string) => {
  return useQuery({
    queryKey: queryKeys.deliveries.byId(id),
    queryFn: async () => {
      const response = await deliveryAPI.getDelivery(id);
      return response.data.data as Delivery;
    },
    enabled: !!id,
  });
};

export const useCustomerDeliveries = (customerId: string) => {
  return useQuery({
    queryKey: queryKeys.deliveries.byCustomer(customerId),
    queryFn: async () => {
      const response = await deliveryAPI.getAllDeliveries({ customerId });
      return response.data.data as Delivery[];
    },
    enabled: !!customerId,
  });
};

export const useDriverDeliveries = (driverId: string) => {
  return useQuery({
    queryKey: queryKeys.deliveries.byDriver(driverId),
    queryFn: async () => {
      const response = await deliveryAPI.getAllDeliveries({ driverId });
      return response.data.data as Delivery[];
    },
    enabled: !!driverId,
  });
};

// User queries
export const useUsers = () => {
  return useQuery({
    queryKey: queryKeys.users.all,
    queryFn: async () => {
      const response = await userAPI.getAllUsers();
      return response.data.data as User[];
    },
  });
};

export const useDrivers = () => {
  return useQuery({
    queryKey: queryKeys.users.drivers,
    queryFn: async () => {
      const response = await userAPI.getDrivers();
      return response.data.data as User[];
    },
  });
};

// Mutations
export const useCreateDelivery = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deliveryAPI.createDelivery,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.deliveries.all });
    },
  });
};

export const useUpdateDeliveryStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, status, notes }: { id: string; status: string; notes?: string }) =>
      deliveryAPI.updateDeliveryStatus(id, { status, deliveryNotes: notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.deliveries.all });
    },
  });
};

export const useAssignDriver = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ deliveryId, driverId }: { deliveryId: string; driverId: string }) =>
      deliveryAPI.assignDriver(deliveryId, driverId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.deliveries.all });
    },
  });
};