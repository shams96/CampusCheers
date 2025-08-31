import request from 'supertest';
import app from '../src/index';
import prisma from '../src/lib/prisma';

describe('Core API Routes', () => {
  let testUser1: any;
  let testUser2: any;
  let testUser3: any;

  beforeAll(async () => {
    // Seed test data with verified users from same school (GAS-style verification)
    const school = await prisma.school.upsert({
      where: { domain: 'test-high-school.edu' },
      update: {},
      create: {
        name: 'Test High School',
        domain: 'test-high-school.edu',
        address: '123 School St, Test City, TX',
        city: 'Test City',
        state: 'TX',
        zipCode: '75013',
        latitude: 33.1032,
        longitude: -96.6989
      } as any
    });

    // Create verified users (GAS app-style - phone verified, school affiliated)
    testUser1 = await prisma.user.create({
      data: {
        phoneNumber: '5551111111',
        name: 'Verified User One',
        schoolId: school.id,
        grade: 11,
        isVerified: true,
        password: 'hashedpassword123',
      } as any
    });

    testUser2 = await prisma.user.create({
      data: {
        phoneNumber: '5552222222',
        name: 'Verified User Two',
        schoolId: school.id,
        grade: 11,
        isVerified: true,
        password: 'hashedpassword123',
      } as any
    });

    testUser3 = await prisma.user.create({
      data: {
        phoneNumber: '5553333333',
        name: 'Verified User Three',
        schoolId: school.id,
        grade: 12,
        isVerified: true,
        password: 'hashedpassword123',
      } as any
    });
  });

  describe('GET /api/users/search', () => {
    it('should return verified users from same school matching search query', async () => {
      const res = await request(app)
        .get('/api/users/search')
        .query({ query: 'Verified', userId: testUser1.id });

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);

      // Verify all returned users are from same school
      res.body.forEach((user: any) => {
        expect(user).toHaveProperty('name');
        expect(user).toHaveProperty('id');
        expect(user).toHaveProperty('schoolId', testUser1.schoolId);
        expect(user).toHaveProperty('isVerified', true);
      });
    });

    it('should exclude current user from results', async () => {
      const res = await request(app)
        .get('/api/users/search')
        .query({ query: 'Verified User One', userId: testUser1.id });

      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(0);
    });

    it('should enforce school isolation - only return users from same school', async () => {
      // This test would create users from different schools to verify isolation
      const differentSchool = await prisma.school.create({
        data: {
          name: 'Different High School',
          domain: 'different-high-school.edu'
        } as any
      });

      const externalUser = await prisma.user.create({
        data: {
          phoneNumber: '5559999999',
          name: 'External User',
          schoolId: differentSchool.id,
          grade: 11,
          isVerified: true,
          password: 'hashedpassword123'
        } as any
      });

      const res = await request(app)
        .get('/api/users/search')
        .query({ query: 'External', userId: testUser1.id });

      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(0); // Should not find external user

      // Clean up
      await prisma.user.delete({ where: { id: externalUser.id, schoolId: externalUser.schoolId } as any });
      await prisma.school.delete({ where: { id: differentSchool.id } });
    });

    it('should only return verified users', async () => {
      const unverifiedUser = await prisma.user.create({
        data: {
          phoneNumber: '5558888888',
          name: 'Unverified User',
          schoolId: testUser1.schoolId,
          grade: 11,
          isVerified: false,
          password: 'hashedpassword123'
        } as any
      });

      const res = await request(app)
        .get('/api/users/search')
        .query({ query: 'Unverified', userId: testUser1.id });

      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(0); // Should not return unverified users

      // Clean up
      await prisma.user.delete({ where: { id: unverifiedUser.id, schoolId: unverifiedUser.schoolId } as any });
    });

    it('should return error for missing query', async () => {
      const res = await request(app)
        .get('/api/users/search')
        .query({ userId: testUser1.id });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error', 'A search query is required.');
    });

    it('should return error for missing userId', async () => {
      const res = await request(app)
        .get('/api/users/search')
        .query({ query: 'test' });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error', 'A userId is required.');
    });
  });

  describe('POST /api/friends/add', () => {
    it('should add a friend successfully', async () => {
      const res = await request(app)
        .post('/api/friends/add')
        .send({ userId: testUser1.id, friendId: testUser2.id });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('user1Id', testUser1.id);
      expect(res.body).toHaveProperty('user2Id', testUser2.id);
    });

    it('should return error for duplicate friendship', async () => {
      const res = await request(app)
        .post('/api/friends/add')
        .send({ userId: testUser1.id, friendId: testUser2.id });

      expect(res.statusCode).toBe(409);
      expect(res.body).toHaveProperty('message', 'You are already friends with this user.');
    });

    it('should return error for missing userId', async () => {
      const res = await request(app)
        .post('/api/friends/add')
        .send({ friendId: testUser2.id });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error', 'Both userId and friendId are required.');
    });

    it('should return error for missing friendId', async () => {
      const res = await request(app)
        .post('/api/friends/add')
        .send({ userId: testUser1.id });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error', 'Both userId and friendId are required.');
    });
  });

  describe('POST /api/seed', () => {
    it('should seed the database successfully', async () => {
      const res = await request(app)
        .post('/api/seed');

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message', 'Database seeded successfully.');
      expect(res.body).toHaveProperty('users');
      expect(Array.isArray(res.body.users)).toBe(true);
    });
  });
});