import { describe, it, expect, beforeEach } from '@jest/globals';
import request from 'supertest';
import app from '../server';
import User from '../models/User';

describe('Authentication Endpoints', () => {
  const strongPassword = 'VeryStrongP@ssw0rd!2025';

  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('POST /api/auth/register', () => {
    const validUserData = {
      name: 'Test User',
      email: 'test@example.com',
      password: strongPassword,
      phone: '1234567890',
      role: 'customer',
      address: {
        street: '123 Test St',
        city: 'Test City',
        state: 'TS',
        zipCode: '12345',
        country: 'USA',
      },
    };

    it('should register a new customer successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(validUserData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(validUserData.email);
      expect(response.body.data.user.role).toBe('customer');
      expect(response.headers['set-cookie']).toBeDefined();
    });

    it('should register a new driver with additional fields', async () => {
      const driverData = {
        ...validUserData,
        email: 'driver@example.com',
        role: 'driver',
        licenseNumber: 'DL123456',
        vehicleInfo: {
          make: 'Ford',
          model: 'Transit',
          year: 2020,
          licensePlate: 'ABC123',
        },
        emergencyContact: {
          name: 'Emergency Contact',
          phone: '9876543210',
        },
        yearsOfExperience: 5,
        backgroundCheckConsent: true,
      };

      const response = await request(app).post('/api/auth/register').send(driverData).expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.role).toBe('driver');
    });

    it('should return 400 for invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ ...validUserData, email: 'invalid-email' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for weak password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ ...validUserData, password: 'password' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            msg: expect.stringContaining('Password strength must be rated okay or strong'),
            path: 'password',
          }),
        ]),
      );
    });

    it('should return 400 for duplicate email', async () => {
      await User.create(validUserData);

      const response = await request(app)
        .post('/api/auth/register')
        .send(validUserData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: strongPassword,
        role: 'customer',
      });
    });

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: strongPassword,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('test@example.com');
      expect(response.headers['set-cookie']).toBeDefined();
    });

    it('should return 401 for invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/me', () => {
    let authCookie: string;

    beforeEach(async () => {
      await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: strongPassword,
        role: 'customer',
      });

      const loginResponse = await request(app).post('/api/auth/login').send({
        email: 'test@example.com',
        password: strongPassword,
      });

      const cookies = loginResponse.headers['set-cookie'];
      const cookie = cookies?.[0];
      expect(cookie).toBeDefined();
      authCookie = cookie as string;
    });

    it('should get current user with valid cookie', async () => {
      const response = await request(app).get('/api/auth/me').set('Cookie', authCookie).expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe('test@example.com');
    });

    it('should return 401 without cookie', async () => {
      const response = await request(app).get('/api/auth/me').expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/logout', () => {
    let authCookie: string;

    beforeEach(async () => {
      await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: strongPassword,
        role: 'customer',
      });

      const loginResponse = await request(app).post('/api/auth/login').send({
        email: 'test@example.com',
        password: strongPassword,
      });

      const cookies = loginResponse.headers['set-cookie'];
      const cookie = cookies?.[0];
      expect(cookie).toBeDefined();
      authCookie = cookie as string;
    });

    it('should logout successfully', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Cookie', authCookie)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Logged out');
    });
  });
});
