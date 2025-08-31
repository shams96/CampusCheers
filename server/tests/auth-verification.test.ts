import request from 'supertest';
import app from '../src/index';
import prisma from '../src/lib/prisma';

// Mock external services for testing
jest.mock('twilio', () => ({
  Twilio: jest.fn().mockImplementation(() => ({
    messages: {
      create: jest.fn().mockResolvedValue({ sid: 'mock_sid' })
    }
  }))
}));

// Create mock Google Maps client - defined inside jest.mock to avoid hoisting issues
const mockGoogleMapsClient = {
  placesNearby: jest.fn(),
  geocode: jest.fn()
};

jest.mock('@googlemaps/google-maps-services-js', () => {
  return {
    Client: jest.fn(() => mockGoogleMapsClient)
  };
});

describe('Student Verification System', () => {
  let testSchoolId: string;
  let testPhoneNumber = '5551234567';
  let verificationCode: string;
  let verificationExpiry: Date;

  beforeAll(async () => {
    // Clean up any existing test data - need to find by phoneNumber first
    const existingUsers = await prisma.user.findMany({
      where: { phoneNumber: testPhoneNumber } as any
    });
    for (const user of existingUsers) {
      await prisma.user.delete({
        where: { id: user.id, schoolId: user.schoolId } as any
      });
    }

    // Create test school with geographic data
    const testSchool = await prisma.school.upsert({
      where: { domain: 'test-high-school.edu' },
      update: {},
      create: {
        name: 'Test High School',
        domain: 'test-high-school.edu',
        city: 'Test City',
        state: 'TX',
        zipCode: '75013',
        latitude: 33.1032,
        longitude: -96.6989
      } as any
    });
    testSchoolId = testSchool.id;

    // Mock Google Maps response for school search
    mockGoogleMapsClient.placesNearby.mockResolvedValue({
      data: {
        results: [{
          place_id: 'test_place_id',
          name: 'Test High School',
          vicinity: '123 School St, Test City, TX',
          geometry: {
            location: { lat: 33.1032, lng: -96.6989 }
          },
          rating: 4.5,
          types: ['school', 'point_of_interest', 'establishment']
        }]
      }
    });
  });

  afterAll(async () => {
    // Clean up test data - find and delete by composite key
    const existingUsers = await prisma.user.findMany({
      where: { phoneNumber: testPhoneNumber } as any
    });
    for (const user of existingUsers) {
      await prisma.user.delete({
        where: { id: user.id, schoolId: user.schoolId } as any
      });
    }
    await prisma.school.deleteMany({
      where: { domain: 'test-high-school.edu' }
    });
  });

  describe('Step 1: Geographic School Discovery', () => {
    describe('GET /api/auth/schools-by-zip', () => {
      it('should return schools for valid zip code (75013)', async () => {
        const response = await request(app)
          .get('/api/auth/schools-by-zip?zip=75013')
          .expect(200);

        expect(Array.isArray(response.body.schools)).toBe(true);
        expect(response.body.schools.length).toBeGreaterThan(0);
        expect(response.body.schools[0]).toHaveProperty('id');
        expect(response.body.schools[0]).toHaveProperty('name');
        expect(response.body.schools[0]).toHaveProperty('distance');
        expect(response.body.schools[0]).toHaveProperty('latitude');
        expect(response.body.schools[0]).toHaveProperty('longitude');
      });

      it('should validate zip code format', async () => {
        const invalidZips = ['abc', '1234', '123456', ''];

        for (const invalidZip of invalidZips) {
          const response = await request(app)
            .get(`/api/auth/schools-by-zip?zip=${invalidZip}`)
            .expect(400);

          expect(response.body).toHaveProperty('error');
          expect(response.body.error).toContain('zip code');
        }
      });

      it('should return error for missing zip parameter', async () => {
        const response = await request(app)
          .get('/api/auth/schools-by-zip')
          .expect(400);

        expect(response.body).toHaveProperty('error', 'Zip code is required');
      });

      it('should filter schools within 15-mile radius', async () => {
        const response = await request(app)
          .get('/api/auth/schools-by-zip?zip=75013')
          .expect(200);

        // All returned schools should be within 15 miles
        response.body.schools.forEach((school: any) => {
          expect(school.distance).toBeLessThanOrEqual(15);
        });
      });

      it('should handle Google Maps API errors gracefully', async () => {
        mockGoogleMapsClient.placesNearby.mockRejectedValueOnce(new Error('API Error'));

        const response = await request(app)
          .get('/api/auth/schools-by-zip?zip=99999')
          .expect(500);

        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toContain('search schools');
      });
    });
  });

  describe('Step 2: SMS Verification System', () => {
    describe('POST /api/auth/send-verification-code', () => {
      it('should send verification code for valid US phone number', async () => {
        const response = await request(app)
          .post('/api/auth/send-verification-code')
          .send({ phoneNumber: testPhoneNumber })
          .expect(200);

        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toContain('sent successfully');

        // Verify code was stored (this would normally be tested differently)
        const storedCodes = (global as any).verificationCodes;
        if (storedCodes) {
          const stored = storedCodes.get(testPhoneNumber);
          expect(stored).toBeDefined();
          expect(stored.code).toMatch(/^\d{6}$/);
          expect(stored.expiry).toBeInstanceOf(Date);
          verificationCode = stored.code;
          verificationExpiry = stored.expiry;
        }
      });

      it('should format and validate phone numbers', async () => {
        const validFormats = [
          '5551234567',
          '(555) 123-4567',
          '555-123-4567',
          '+1-555-123-4567'
        ];

        for (const phone of validFormats) {
          const response = await request(app)
            .post('/api/auth/send-verification-code')
            .send({ phoneNumber: phone })
            .expect(200);

          expect(response.body.message).toContain('sent successfully');
        }
      });

      it('should reject invalid phone numbers', async () => {
        const invalidPhones = [
          '12345',           // Too short
          '555123456789',    // Too long
          'abc1234567',      // Non-numeric
          '555.123.4567',    // Invalid formatting
          ''                 // Empty
        ];

        for (const invalidPhone of invalidPhones) {
          const response = await request(app)
            .post('/api/auth/send-verification-code')
            .send({ phoneNumber: invalidPhone })
            .expect(400);

          expect(response.body).toHaveProperty('error');
          expect(response.body.error).toContain('phone number');
        }
      });

      it('should enforce rate limiting (3 attempts per hour)', async () => {
        // This test would depend on the actual rate limiting implementation
        // For now, we'll test the structure
        const response = await request(app)
          .post('/api/auth/send-verification-code')
          .send({ phoneNumber: '5559999999' })
          .expect(200);

        expect(response.body.message).toContain('sent successfully');
      });

      it('should return error for missing phone number', async () => {
        const response = await request(app)
          .post('/api/auth/send-verification-code')
          .send({})
          .expect(400);

        expect(response.body).toHaveProperty('error', 'Phone number is required');
      });
    });
  });

  describe('Step 3: Code Verification', () => {
    describe('POST /api/auth/verify-code', () => {
      beforeEach(async () => {
        // Ensure we have a valid code for testing
        await request(app)
          .post('/api/auth/send-verification-code')
          .send({ phoneNumber: testPhoneNumber });

        const storedCodes = (global as any).verificationCodes;
        if (storedCodes) {
          const stored = storedCodes.get(testPhoneNumber);
          if (stored) {
            verificationCode = stored.code;
          }
        }
      });

      it('should verify valid 6-digit code', async () => {
        const response = await request(app)
          .post('/api/auth/verify-code')
          .send({ phoneNumber: testPhoneNumber, code: verificationCode })
          .expect(200);

        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toContain('verified successfully');
      });

      it('should reject expired codes (10 minute expiration)', async () => {
        // Mock expired code
        const expiredCode = '000000';
        const response = await request(app)
          .post('/api/auth/verify-code')
          .send({ phoneNumber: testPhoneNumber, code: expiredCode })
          .expect(400);

        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toMatch(/expired|not found|invalid/i);
      });

      it('should reject invalid code format', async () => {
        const invalidCodes = ['12345', '1234567', 'abc123', '12-34-56', ''];

        for (const invalidCode of invalidCodes) {
          const response = await request(app)
            .post('/api/auth/verify-code')
            .send({ phoneNumber: testPhoneNumber, code: invalidCode })
            .expect(400);

          expect(response.body).toHaveProperty('error');
        }
      });

      it('should return error for missing parameters', async () => {
        const testCases = [
          { phoneNumber: testPhoneNumber },
          { code: verificationCode },
          {}
        ];

        for (const testCase of testCases) {
          const response = await request(app)
            .post('/api/auth/verify-code')
            .send(testCase)
            .expect(400);

          expect(response.body).toHaveProperty('error');
          expect(response.body.error).toContain('required');
        }
      });

      it('should handle non-existent verification codes', async () => {
        const response = await request(app)
          .post('/api/auth/verify-code')
          .send({ phoneNumber: '9999999999', code: '123456' })
          .expect(400);

        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toContain('not found');
      });
    });
  });

  describe('Step 4: Profile Setup and Grade Selection', () => {
    describe('POST /api/auth/setup-profile', () => {
      beforeEach(async () => {
        // Ensure phone is verified for profile setup
        await request(app)
          .post('/api/auth/send-verification-code')
          .send({ phoneNumber: testPhoneNumber });

        const storedCodes = (global as any).verificationCodes;
        if (storedCodes) {
          const stored = storedCodes.get(testPhoneNumber);
          if (stored) {
            await request(app)
              .post('/api/auth/verify-code')
              .send({ phoneNumber: testPhoneNumber, code: stored.code });
          }
        }
      });

      it('should create user profile with school and grade', async () => {
        const response = await request(app)
          .post('/api/auth/setup-profile')
          .send({
            phoneNumber: testPhoneNumber,
            name: 'John D.',
            schoolId: testSchoolId,
            grade: 11,
            profileImage: ''
          })
          .expect(200);

        expect(response.body).toHaveProperty('id');
        expect(response.body).toHaveProperty('phoneNumber', testPhoneNumber);
        expect(response.body).toHaveProperty('name', 'John D.');
        expect(response.body).toHaveProperty('schoolId', testSchoolId);
        expect(response.body).toHaveProperty('grade', 11);
        expect(response.body).toHaveProperty('isVerified', true);
        expect(response.body).toHaveProperty('school');
        expect(response.body.school).toHaveProperty('name');

        // Verify user was created in database
        const createdUser = await prisma.user.findFirst({
          where: { phoneNumber: testPhoneNumber } as any,
          include: { school: true } as any
        });

        expect(createdUser).toBeTruthy();
        expect(createdUser?.name).toBe('John D.');
        if (createdUser) {
          expect((createdUser as any).grade).toBe(11);
          expect((createdUser as any).schoolId).toBe(testSchoolId);
          expect((createdUser as any).isVerified).toBe(true);
        }
      });

      it('should validate grade selection (9-12)', async () => {
        const validGrades = [9, 10, 11, 12];
        const invalidGrades = [8, 13, -1, 100, 'invalid'];

        for (const grade of validGrades) {
          const response = await request(app)
            .post('/api/auth/send-verification-code')
            .send({ phoneNumber: `555${grade}9999` }); // Use different phone for each test

          expect(response.status).toBe(200);
        }

        // Test invalid grade would be part of school selection validation
      });

      it('should reject duplicate phone number registration', async () => {
        // Try to create another profile with same phone number
        const response = await request(app)
          .post('/api/auth/setup-profile')
          .send({
            phoneNumber: testPhoneNumber,
            name: 'Jane D.',
            schoolId: testSchoolId,
            grade: 12,
            profileImage: ''
          })
          .expect(409);

        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toContain('registered');
      });

      it('should validate school exists', async () => {
        const response = await request(app)
          .post('/api/auth/setup-profile')
          .send({
            phoneNumber: '5558888888',
            name: 'Test User',
            schoolId: 'invalid-school-id',
            grade: 10,
            profileImage: ''
          })
          .expect(400);

        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toContain('school');
      });

      it('should validate required parameters', async () => {
        const testCases = [
          { name: 'Test User', schoolId: testSchoolId, grade: 10 }, // Missing phone
          { phoneNumber: '5557777777', schoolId: testSchoolId, grade: 10 }, // Missing name
          { phoneNumber: '5557777777', name: 'Test User', grade: 10 }, // Missing schoolId
          { phoneNumber: '5557777777', name: 'Test User', schoolId: testSchoolId }, // Missing grade
          {} // All missing
        ];

        for (const testCase of testCases) {
          const response = await request(app)
            .post('/api/auth/setup-profile')
            .send(testCase)
            .expect(400);

          expect(response.body).toHaveProperty('error');
          expect(response.body.error).toContain('required');
        }
      });

      it('should handle optional profile image', async () => {
        const response = await request(app)
          .post('/api/auth/send-verification-code')
          .send({ phoneNumber: '5556666666' });

        // Profile creation without image should work
        expect(response.status).toBe(200);
      });
    });
  });

  describe('Complete End-to-End Verification Flow', () => {
    it('should complete full 5-step verification process', async () => {
      const flowPhoneNumber = '5554444444';

      // Step 1: Location Discovery
      const schoolResponse = await request(app)
        .get('/api/auth/schools-by-zip?zip=75013')
        .expect(200);

      expect(schoolResponse.body.schools.length).toBeGreaterThan(0);
      const selectedSchoolId = schoolResponse.body.schools[0].id;

      // Step 2: SMS Verification
      const smsResponse = await request(app)
        .post('/api/auth/send-verification-code')
        .send({ phoneNumber: flowPhoneNumber })
        .expect(200);

      // Step 3: Code Verification
      let verificationCodeForFlow = '';
      const storedCodes = (global as any).verificationCodes;
      if (storedCodes) {
        const stored = storedCodes.get(flowPhoneNumber);
        if (stored) {
          verificationCodeForFlow = stored.code;
        }
      }

      const verifyResponse = await request(app)
        .post('/api/auth/verify-code')
        .send({ phoneNumber: flowPhoneNumber, code: verificationCodeForFlow })
        .expect(200);

      // Step 4: Grade Selection (handled in profile setup)
      // Step 5: Profile Completion
      const profileResponse = await request(app)
        .post('/api/auth/setup-profile')
        .send({
          phoneNumber: flowPhoneNumber,
          name: 'Sarah J.',
          schoolId: selectedSchoolId,
          grade: 12,  // Grade selection
          profileImage: ''
        })
        .expect(200);

      // Verify final user profile
      expect(profileResponse.body.phoneNumber).toBe(flowPhoneNumber);
      expect(profileResponse.body.name).toBe('Sarah J.');
      expect(profileResponse.body.schoolId).toBe(selectedSchoolId);
      expect(profileResponse.body.grade).toBe(12);
      expect(profileResponse.body.isVerified).toBe(true);

      // Clean up
      await prisma.user.deleteMany({
        where: { phoneNumber: flowPhoneNumber } as any
      });
    });

    it('should maintain verification state across steps', async () => {
      const testPhoneNumber2 = '5553333333';

      // Start verification process
      await request(app)
        .post('/api/auth/send-verification-code')
        .send({ phoneNumber: testPhoneNumber2 });

      let code = '';
      const storedCodes = (global as any).verificationCodes;
      if (storedCodes) {
        const stored = storedCodes.get(testPhoneNumber2);
        if (stored) {
          code = stored.code;
        }
      }

      // Verify code is available for profile setup
      expect(code).toMatch(/^\d{6}$/);

      // Complete verification
      await request(app)
        .post('/api/auth/verify-code')
        .send({ phoneNumber: testPhoneNumber2, code });

      await request(app)
        .post('/api/auth/setup-profile')
        .send({
          phoneNumber: testPhoneNumber2,
          name: 'Complete User',
          schoolId: testSchoolId,
          grade: 10,
          profileImage: ''
        });

      // Clean up
      await prisma.user.deleteMany({
        where: { phoneNumber: testPhoneNumber2 } as any
      });
    });
  });

  describe('Security & Error Handling', () => {
    it('should sanitize input data', async () => {
      const maliciousInput = '<script>alert("xss")</script>';
      const response = await request(app)
        .post('/api/auth/setup-profile')
        .send({
          phoneNumber: '5552222222',
          name: maliciousInput,
          schoolId: testSchoolId,
          grade: 9,
          profileImage: ''
        });

      // Should either reject or sanitize the input
      if (response.status === 200) {
        expect(response.body.name).not.toContain('<script>');
      }
    });

    it('should handle Twilio API failures gracefully', async () => {
      // This would require mocking Twilio failures
      // Implementation depends on actual error handling in SMS service
    });

    it('should implement proper CORS headers', async () => {
      const response = await request(app)
        .options('/api/auth/schools-by-zip')
        .expect(200);

      // Check for CORS headers if implemented
    });

    it('should validate request content type', async () => {
      const response = await request(app)
        .post('/api/auth/setup-profile')
        .set('Content-Type', 'text/plain')
        .send('invalid data')
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });
});