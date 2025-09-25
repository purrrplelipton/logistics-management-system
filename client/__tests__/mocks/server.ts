import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

// Mock data
export const mockUser = {
  _id: 'user123',
  name: 'John Doe',
  email: 'john@example.com',
  role: 'customer',
  phone: '+1234567890',
  address: {
    street: '123 Main St',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    country: 'USA',
  },
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

export const mockDriverUser = {
  _id: 'driver123',
  name: 'Jane Smith',
  email: 'jane@example.com',
  role: 'driver',
  phone: '+1234567891',
  address: {
    street: '456 Oak Ave',
    city: 'Los Angeles',
    state: 'CA',
    zipCode: '90001',
    country: 'USA',
  },
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

export const mockDelivery = {
  _id: 'delivery123',
  trackingNumber: 'TRK123456',
  customerId: mockUser,
  driverId: mockDriverUser,
  status: 'Pending',
  pickupAddress: {
    street: '123 Pickup St',
    city: 'Pickup City',
    state: 'PC',
    zipCode: '12345',
    country: 'USA',
  },
  deliveryAddress: {
    street: '456 Delivery Ave',
    city: 'Delivery City',
    state: 'DC',
    zipCode: '67890',
    country: 'USA',
  },
  packageDetails: {
    description: 'Important documents',
    weight: 2.5,
    dimensions: {
      length: 30,
      width: 20,
      height: 10,
    },
    value: 100,
  },
  estimatedDelivery: '2024-01-15T00:00:00Z',
  createdAt: '2024-01-10T00:00:00Z',
  updatedAt: '2024-01-10T00:00:00Z',
};

// API handlers
export const handlers = [
  // Auth endpoints
  http.post('*/api/auth/register', async ({ request }) => {
    const data = await request.json() as any;
    
    if (data.email === 'existing@example.com') {
      return HttpResponse.json(
        { 
          success: false, 
          message: 'Email already exists',
          error: 'EMAIL_EXISTS'
        },
        { status: 400 }
      );
    }

    return HttpResponse.json({
      success: true,
      data: {
        token: 'fake-jwt-token',
        user: {
          ...mockUser,
          name: data.name,
          email: data.email,
          role: data.role,
        },
      },
      message: 'Registration successful',
    });
  }),

  http.post('*/api/auth/login', async ({ request }) => {
    const credentials = await request.json() as any;
    
    if (credentials.email === 'wrong@example.com' || credentials.password === 'wrongpassword') {
      return HttpResponse.json(
        { 
          success: false, 
          message: 'Invalid credentials',
          error: 'INVALID_CREDENTIALS'
        },
        { status: 401 }
      );
    }

    return HttpResponse.json({
      success: true,
      data: {
        token: 'fake-jwt-token',
        user: mockUser,
      },
      message: 'Login successful',
    });
  }),

  http.get('*/api/auth/me', () => {
    return HttpResponse.json({
      success: true,
      data: mockUser,
      message: 'User retrieved',
    });
  }),

  http.post('*/api/auth/logout', () => {
    return HttpResponse.json({
      success: true,
      data: null,
      message: 'Logout successful',
    });
  }),

  // User endpoints
  http.get('*/api/users', ({ request }) => {
    const url = new URL(request.url);
    const role = url.searchParams.get('role');
    
    if (role === 'driver') {
      return HttpResponse.json({
        success: true,
        data: [mockDriverUser],
        message: 'Drivers retrieved',
      });
    }
    
    return HttpResponse.json({
      success: true,
      data: [mockUser, mockDriverUser],
      message: 'Users retrieved',
    });
  }),

  http.get('*/api/users/drivers', () => {
    return HttpResponse.json({
      success: true,
      data: [mockDriverUser],
      message: 'Drivers retrieved',
    });
  }),

  http.get('*/api/users/:id', ({ params }) => {
    const { id } = params;
    
    if (id === 'nonexistent') {
      return HttpResponse.json(
        { 
          success: false, 
          message: 'User not found',
          error: 'USER_NOT_FOUND'
        },
        { status: 404 }
      );
    }
    
    return HttpResponse.json({
      success: true,
      data: id === 'driver123' ? mockDriverUser : mockUser,
      message: 'User retrieved',
    });
  }),

  // Delivery endpoints
  http.get('*/api/deliveries', ({ request }) => {
    const url = new URL(request.url);
    const customerId = url.searchParams.get('customerId');
    
    if (customerId) {
      return HttpResponse.json({
        success: true,
        data: [mockDelivery],
        message: 'Customer deliveries retrieved',
      });
    }
    
    return HttpResponse.json({
      success: true,
      data: [mockDelivery],
      message: 'Deliveries retrieved',
    });
  }),

  http.post('*/api/deliveries', async ({ request }) => {
    const data = await request.json() as any;
    
    if (!data.pickupAddress || !data.deliveryAddress) {
      return HttpResponse.json(
        { 
          success: false, 
          message: 'Missing required fields',
          error: 'VALIDATION_ERROR'
        },
        { status: 400 }
      );
    }

    return HttpResponse.json({
      success: true,
      data: {
        ...mockDelivery,
        trackingNumber: `TRK${Date.now()}`,
        pickupAddress: data.pickupAddress,
        deliveryAddress: data.deliveryAddress,
        packageDetails: data.packageDetails,
      },
      message: 'Delivery created',
    });
  }),

  http.get('*/api/deliveries/:id', ({ params }) => {
    const { id } = params;
    
    if (id === 'nonexistent') {
      return HttpResponse.json(
        { 
          success: false, 
          message: 'Delivery not found',
          error: 'DELIVERY_NOT_FOUND'
        },
        { status: 404 }
      );
    }
    
    return HttpResponse.json({
      success: true,
      data: mockDelivery,
      message: 'Delivery retrieved',
    });
  }),

  http.put('*/api/deliveries/:id/assign', async ({ params, request }) => {
    const { id } = params;
    const data = await request.json() as any;
    
    if (id === 'nonexistent') {
      return HttpResponse.json(
        { 
          success: false, 
          message: 'Delivery not found',
          error: 'DELIVERY_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      success: true,
      data: {
        ...mockDelivery,
        driverId: data.driverId,
        status: 'Assigned',
      },
      message: 'Driver assigned successfully',
    });
  }),

  http.put('*/api/deliveries/:id/status', async ({ params, request }) => {
    const { id } = params;
    const data = await request.json() as any;
    
    return HttpResponse.json({
      success: true,
      data: {
        ...mockDelivery,
        status: data.status,
        deliveryNotes: data.deliveryNotes,
      },
      message: 'Delivery status updated',
    });
  }),

  http.get('*/api/deliveries/track/:trackingNumber', ({ params }) => {
    const { trackingNumber } = params;
    
    if (trackingNumber === 'INVALID') {
      return HttpResponse.json(
        { 
          success: false, 
          message: 'Tracking number not found',
          error: 'TRACKING_NOT_FOUND'
        },
        { status: 404 }
      );
    }
    
    return HttpResponse.json({
      success: true,
      data: {
        trackingNumber,
        status: 'InTransit',
        createdAt: '2024-01-10T00:00:00Z',
        estimatedDeliveryDate: '2024-01-15T00:00:00Z',
      },
      message: 'Tracking information retrieved',
    });
  }),
];

// Setup MSW server
export const server = setupServer(...handlers);

// Error handlers for testing error scenarios
export const errorHandlers = {
  networkError: http.get('*/api/*', () => {
    return HttpResponse.error();
  }),
  
  serverError: http.get('*/api/*', () => {
    return HttpResponse.json(
      { 
        success: false, 
        message: 'Internal server error',
        error: 'SERVER_ERROR'
      },
      { status: 500 }
    );
  }),
  
  authError: http.get('*/api/*', () => {
    return HttpResponse.json(
      { 
        success: false, 
        message: 'Unauthorized',
        error: 'UNAUTHORIZED'
      },
      { status: 401 }
    );
  }),
};