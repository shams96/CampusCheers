import request from 'supertest';
import app from '../src/index';
import prisma from '../src/lib/prisma';

describe('Auth API Routes', () => {
  beforeAll(async () => {
    // Seed test school
    await prisma.school.upsert({
      where: { domain: 'test.edu' },
      update: {},
      create: {
        name: 'Test University',
        domain: 'test.edu',
      },
    });
  });

  describe('POST /api/auth/verify-school', () => {
    it('should return success for valid school email', async () => {
      const res = await request(app)
        .post('/api/auth/verify-school')
        .send({ email: 'test@test.edu' });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message', 'Verification link sent!');
    });

    it('should return error for invalid school email', async () => {
      const res = await request(app)
        .post('/api/auth/verify-school')
        .send({ email: 'test@invalid.edu' });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error', 'School not found');
    });

    it('should return error for missing email', async () => {
      const res = await request(app)
        .post('/api/auth/verify-school')
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error', 'Email is required');
    });
  });

  describe('POST /api/auth/setup-profile', () => {
    it('should create a user profile successfully', async () => {
      const userData = {
        phoneNumber: '+1234567890',
        name: 'New User',
        schoolId: 'test-school-id',
        profileImage: 'https://example.com/image.jpg',
      };

      // First, create a test school
      const school = await prisma.school.upsert({
        where: { domain: 'test.edu' },
        update: {},
        create: {
          id: 'test-school-id',
          name: 'Test University',
          domain: 'test.edu',
        },
      });

      const res = await request(app)
        .post('/api/auth/setup-profile')
        .send(userData);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('name', userData.name);
      expect(res.body).toHaveProperty('profileImage', userData.profileImage);
      expect(res.body).toHaveProperty('schoolId', school.id);
    });

    it('should return error for missing required fields', async () => {
      const res = await request(app)
        .post('/api/auth/setup-profile')
        .send({ phoneNumber: '+1234567890' });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error', 'Phone number, name, and school ID are required');
    });

    it('should return error for invalid school ID', async () => {
      const res = await request(app)
        .post('/api/auth/setup-profile')
        .send({
          phoneNumber: '+1234567890',
          name: 'Test User',
          schoolId: 'invalid-school-id',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error', 'School not found');
    });
  });
});