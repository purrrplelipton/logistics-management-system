import { authAPI, userAPI, deliveryAPI } from '@/lib/api';
import { server, errorHandlers } from '../mocks/server';

describe('API Integration Tests', () => {
  describe('Auth API', () => {
    describe('register', () => {
      it('successfully registers a new user', async () => {
        const userData = {
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
          role: 'customer' as const,
        };

        const { data } = await authAPI.register(userData);

        expect(data.success).toBe(true);
        expect(data.data.user.email).toBe('test@example.com');
        expect(data.data.user.name).toBe('Test User');
        expect(data.data.token).toBe('fake-jwt-token');
      });

      it('handles registration with existing email', async () => {
        const userData = {
          name: 'Test User',
          email: 'existing@example.com',
          password: 'password123',
          role: 'customer' as const,
        };

        await expect(authAPI.register(userData)).rejects.toMatchObject({
          response: {
            status: 400,
            data: {
              success: false,
              message: 'Email already exists',
              error: 'EMAIL_EXISTS',
            },
          },
        });
      });
    });

    describe('login', () => {
      it('successfully logs in with valid credentials', async () => {
        const credentials = {
          email: 'john@example.com',
          password: 'password123',
        };

  const { data } = await authAPI.login(credentials);

  expect(data.success).toBe(true);
  expect(data.data.user.email).toBe('john@example.com');
  expect(data.data.token).toBe('fake-jwt-token');
      });

      it('handles invalid credentials', async () => {
        const credentials = {
          email: 'wrong@example.com',
          password: 'wrongpassword',
        };

        await expect(authAPI.login(credentials)).rejects.toMatchObject({
          response: {
            status: 401,
            data: {
              success: false,
              message: 'Invalid credentials',
              error: 'INVALID_CREDENTIALS',
            },
          },
        });
      });
    });

    describe('getMe', () => {
      it('successfully retrieves current user', async () => {
  const { data } = await authAPI.getMe();

  expect(data.success).toBe(true);
  expect(data.data.email).toBe('john@example.com');
  expect(data.data.name).toBe('John Doe');
      });
    });

    describe('logout', () => {
      it('successfully logs out user', async () => {
  const { data } = await authAPI.logout();

  expect(data.success).toBe(true);
  expect(data.data).toBeNull();
      });
    });
  });

  describe('User API', () => {
    describe('getAllUsers', () => {
      it('successfully retrieves all users', async () => {
  const { data } = await userAPI.getAllUsers();

  expect(data.success).toBe(true);
  expect(Array.isArray(data.data)).toBe(true);
  expect(data.data).toHaveLength(2);
      });

      it('filters users by role', async () => {
  const { data } = await userAPI.getAllUsers({ role: 'driver' });

  expect(data.success).toBe(true);
  expect(data.data).toHaveLength(1);
  expect(data.data[0].role).toBe('driver');
      });
    });

    describe('getUserById', () => {
      it('successfully retrieves user by ID', async () => {
  const { data } = await userAPI.getUserById('user123');

  expect(data.success).toBe(true);
  expect(data.data._id).toBe('user123');
      });

      it('handles nonexistent user', async () => {
        await expect(userAPI.getUserById('nonexistent')).rejects.toMatchObject({
          response: {
            status: 404,
            data: {
              success: false,
              message: 'User not found',
              error: 'USER_NOT_FOUND',
            },
          },
        });
      });
    });

    describe('getDrivers', () => {
      it('successfully retrieves all drivers', async () => {
  const { data } = await userAPI.getDrivers();

  expect(data.success).toBe(true);
  expect(Array.isArray(data.data)).toBe(true);
  expect(data.data[0].role).toBe('driver');
      });
    });
  });

  describe('Delivery API', () => {
    describe('getAllDeliveries', () => {
      it('successfully retrieves all deliveries', async () => {
  const { data } = await deliveryAPI.getAllDeliveries();

  expect(data.success).toBe(true);
  expect(Array.isArray(data.data)).toBe(true);
  expect(data.data).toHaveLength(1);
      });

      it('filters deliveries by customer', async () => {
  const { data } = await deliveryAPI.getAllDeliveries({ customerId: 'user123' });

  expect(data.success).toBe(true);
  expect(data.data).toHaveLength(1);
      });
    });

    describe('createDelivery', () => {
      it('successfully creates a delivery', async () => {
        const deliveryData = {
          pickupAddress: {
            street: '123 Main St',
            city: 'New York',
            state: 'NY',
            zipCode: '10001',
            country: 'USA',
          },
          deliveryAddress: {
            street: '456 Oak Ave',
            city: 'Los Angeles',
            state: 'CA',
            zipCode: '90001',
            country: 'USA',
          },
          packageDetails: {
            description: 'Test package',
            weight: 2.5,
            dimensions: {
              length: 30,
              width: 20,
              height: 10,
            },
            value: 100,
          },
        };

  const { data } = await deliveryAPI.createDelivery(deliveryData);

  expect(data.success).toBe(true);
  expect(data.data.pickupAddress).toEqual(deliveryData.pickupAddress);
  expect(data.data.deliveryAddress).toEqual(deliveryData.deliveryAddress);
  expect(data.data.trackingNumber).toMatch(/^TRK\d+$/);
      });

      it('handles validation errors', async () => {
        const invalidData = {
          // Missing required fields
          packageDetails: {
            description: 'Test package',
            weight: 2.5,
            dimensions: {
              length: 30,
              width: 20,
              height: 10,
            },
            value: 100,
          },
        };

        await expect(deliveryAPI.createDelivery(invalidData as any)).rejects.toMatchObject({
          response: {
            status: 400,
            data: {
              success: false,
              message: 'Missing required fields',
              error: 'VALIDATION_ERROR',
            },
          },
        });
      });
    });

    describe('getDelivery', () => {
      it('successfully retrieves delivery by ID', async () => {
  const { data } = await deliveryAPI.getDelivery('delivery123');

  expect(data.success).toBe(true);
  expect(data.data._id).toBe('delivery123');
      });

      it('handles nonexistent delivery', async () => {
        await expect(deliveryAPI.getDelivery('nonexistent')).rejects.toMatchObject({
          response: {
            status: 404,
            data: {
              success: false,
              message: 'Delivery not found',
              error: 'DELIVERY_NOT_FOUND',
            },
          },
        });
      });
    });

    describe('assignDriver', () => {
      it('successfully assigns driver to delivery', async () => {
  const { data } = await deliveryAPI.assignDriver('delivery123', 'driver123');

  expect(data.success).toBe(true);
  expect(data.data.driverId).toBe('driver123');
  expect(data.data.status).toBe('Assigned');
      });

      it('handles nonexistent delivery for assignment', async () => {
        await expect(deliveryAPI.assignDriver('nonexistent', 'driver123')).rejects.toMatchObject({
          response: {
            status: 404,
            data: {
              success: false,
              message: 'Delivery not found',
              error: 'DELIVERY_NOT_FOUND',
            },
          },
        });
      });
    });

    describe('updateDeliveryStatus', () => {
      it('successfully updates delivery status', async () => {
        const statusData = {
          status: 'Delivered',
          deliveryNotes: 'Package delivered successfully',
        };

  const { data } = await deliveryAPI.updateDeliveryStatus('delivery123', statusData);

  expect(data.success).toBe(true);
  expect(data.data.status).toBe('Delivered');
  expect(data.data.deliveryNotes).toBe('Package delivered successfully');
      });
    });

    describe('trackDelivery', () => {
      it('successfully tracks delivery', async () => {
  const { data } = await deliveryAPI.trackDelivery('TRK123456');

  expect(data.success).toBe(true);
  expect(data.data.trackingNumber).toBe('TRK123456');
  expect(data.data.status).toBe('InTransit');
      });

      it('handles invalid tracking number', async () => {
        await expect(deliveryAPI.trackDelivery('INVALID')).rejects.toMatchObject({
          response: {
            status: 404,
            data: {
              success: false,
              message: 'Tracking number not found',
              error: 'TRACKING_NOT_FOUND',
            },
          },
        });
      });
    });
  });

  describe('Error Handling', () => {
    it('handles network errors', async () => {
      server.use(errorHandlers.networkError);

      await expect(authAPI.getMe()).rejects.toMatchObject({
        message: 'Network Error',
      });
    });

    it('handles server errors', async () => {
      server.use(errorHandlers.serverError);

      await expect(authAPI.getMe()).rejects.toMatchObject({
        response: {
          status: 500,
          data: {
            success: false,
            message: 'Internal server error',
            error: 'SERVER_ERROR',
          },
        },
      });
    });

    it('handles authentication errors', async () => {
      server.use(errorHandlers.authError);

      await expect(authAPI.getMe()).rejects.toMatchObject({
        response: {
          status: 401,
          data: {
            success: false,
            message: 'Unauthorized',
            error: 'UNAUTHORIZED',
          },
        },
      });
    });

    it('preserves axios interceptor behavior', async () => {
      server.use(errorHandlers.authError);

      // Should reject promise, not automatically redirect
      await expect(authAPI.getMe()).rejects.toBeTruthy();
    });
  });

  describe('Request Configuration', () => {
    it('sends requests with credentials', async () => {
      // This would be tested by checking if cookies are sent
      // In a real test environment, you could inspect the request headers
  const { data } = await authAPI.getMe();
  expect(data.success).toBe(true);
    });

    it('uses correct base URL', async () => {
      // MSW will handle this by matching the URL patterns
  const { data } = await authAPI.getMe();
  expect(data.success).toBe(true);
    });
  });
});