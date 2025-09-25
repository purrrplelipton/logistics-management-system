import { describe, it, expect } from '@jest/globals';
import request from 'supertest';
import app from '../../server';
import User from '../../models/User';
import { IUser } from '../../types';

const baseDeliveryPayload = {
  pickupAddress: {
    street: '123 Pickup St',
    city: 'Origin City',
    state: 'OC',
    zipCode: '12345',
    country: 'USA'
  },
  deliveryAddress: {
    street: '789 Dropoff Ave',
    city: 'Destination City',
    state: 'DC',
    zipCode: '67890',
    country: 'USA'
  },
  packageDetails: {
    description: 'Test package',
    weight: 5,
    dimensions: {
      length: 10,
      width: 5,
      height: 3
    },
    value: 100
  },
  estimatedDeliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
};

const createUserAndLogin = async (
  role: 'admin' | 'customer' | 'driver'
): Promise<{ user: IUser; cookie: string }> => {
  const password = 'StrongP@ssw0rd';
  const uniqueSuffix = `${Date.now()}-${Math.random()}`;
  const email = `${role}-${uniqueSuffix}@example.com`;

  const user = await User.create({
    name: `${role} user`,
    email,
    password,
    role,
    isActive: true
  });

  const response = await request(app)
    .post('/api/auth/login')
    .send({ email, password })
    .expect(200);

  const cookies = response.headers['set-cookie'];
  if (!cookies) {
    throw new Error('Authentication cookie was not set');
  }

  const cookie = cookies[0];
  if (!cookie) {
    throw new Error('Authentication cookie was not set');
  }

  return { user: user as IUser, cookie };
};

describe('Delivery routes integration', () => {
  it('allows a customer to create a delivery', async () => {
    const { cookie } = await createUserAndLogin('customer');

    const response = await request(app)
      .post('/api/deliveries')
      .set('Cookie', cookie)
      .send(baseDeliveryPayload)
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe('Pending');
    expect(response.body.data.trackingNumber).toBeDefined();
    expect(response.body.data.customerId).toBeDefined();
  });

  it('allows an admin to list deliveries with pagination data', async () => {
    const customer = await createUserAndLogin('customer');

    const creationResponse = await request(app)
      .post('/api/deliveries')
      .set('Cookie', customer.cookie)
      .send(baseDeliveryPayload)
      .expect(201);

    expect(creationResponse.body.success).toBe(true);

    const admin = await createUserAndLogin('admin');

    const response = await request(app)
      .get('/api/deliveries')
      .set('Cookie', admin.cookie)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.pagination).toMatchObject({
      currentPage: 1,
      totalItems: 1
    });
  });

  it('allows an admin to assign a driver and driver to update delivery status', async () => {
    const customer = await createUserAndLogin('customer');
    const admin = await createUserAndLogin('admin');
    const driver = await createUserAndLogin('driver');

    const creationResponse = await request(app)
      .post('/api/deliveries')
      .set('Cookie', customer.cookie)
      .send(baseDeliveryPayload)
      .expect(201);

    const deliveryId = creationResponse.body.data._id;

    const assignResponse = await request(app)
      .put(`/api/deliveries/${deliveryId}/assign`)
      .set('Cookie', admin.cookie)
      .send({ driverId: driver.user.id })
      .expect(200);

    expect(assignResponse.body.success).toBe(true);
    const assignedDriver = assignResponse.body.data.driverId;
    const assignedDriverId = typeof assignedDriver === 'string' ? assignedDriver : assignedDriver?._id;
    expect(assignedDriverId).toBe(driver.user.id);
    expect(assignResponse.body.data.status).toBe('InTransit');

    const statusResponse = await request(app)
      .put(`/api/deliveries/${deliveryId}/status`)
      .set('Cookie', driver.cookie)
      .send({ status: 'Delivered', deliveryNotes: 'Package delivered safely' })
      .expect(200);

    expect(statusResponse.body.success).toBe(true);
    expect(statusResponse.body.data.status).toBe('Delivered');
    expect(statusResponse.body.data.actualDeliveryDate).toBeDefined();
  });

  it('allows public users to track deliveries by tracking number', async () => {
    const customer = await createUserAndLogin('customer');

    const creationResponse = await request(app)
      .post('/api/deliveries')
      .set('Cookie', customer.cookie)
      .send(baseDeliveryPayload)
      .expect(201);

    const trackingNumber = creationResponse.body.data.trackingNumber;

    const response = await request(app)
      .get(`/api/deliveries/track/${trackingNumber}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.trackingNumber).toBe(trackingNumber);
  });

  it('prevents drivers from updating deliveries they are not assigned to', async () => {
    const customer = await createUserAndLogin('customer');
    const driverOne = await createUserAndLogin('driver');
    const driverTwo = await createUserAndLogin('driver');

    const creationResponse = await request(app)
      .post('/api/deliveries')
      .set('Cookie', customer.cookie)
      .send(baseDeliveryPayload)
      .expect(201);

    const deliveryId = creationResponse.body.data._id;

    // Assign to driverOne using admin privileges
    const admin = await createUserAndLogin('admin');
    await request(app)
      .put(`/api/deliveries/${deliveryId}/assign`)
      .set('Cookie', admin.cookie)
      .send({ driverId: driverOne.user.id })
      .expect(200);

    const response = await request(app)
      .put(`/api/deliveries/${deliveryId}/status`)
      .set('Cookie', driverTwo.cookie)
      .send({ status: 'InTransit' })
      .expect(403);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('Access denied');
  });
});
