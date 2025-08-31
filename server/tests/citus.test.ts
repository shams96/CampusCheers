import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

// Load test environment variables
config({ path: '.env.test' });

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

describe('Citus Sharding Tests', () => {
  let testSchool: any;
  let testUser1: any;
  let testUser2: any;
  let testMoment: any;
  let testHypeRound: any;

  beforeAll(async () => {
    // Create test school
    testSchool = await prisma.school.upsert({
      where: { domain: 'test.edu' },
      update: {},
      create: {
        name: 'Test University',
        domain: 'test.edu',
      },
    });

    // Create test users
    testUser1 = await prisma.user.create({
      data: {
        id: 'testuser1',
        email: 'user1@test.edu',
        name: 'User One',
        password: 'password',
        schoolId: testSchool.id,
      },
    });

    testUser2 = await prisma.user.create({
      data: {
        id: 'testuser2',
        email: 'user2@test.edu',
        name: 'User Two',
        password: 'password',
        schoolId: testSchool.id,
      },
    });
  });

  describe('Schema Structure', () => {
    it('should have correct schema structure for Citus sharding', async () => {
      // This test verifies that the schema has been updated to support Citus sharding
      // by checking that we can create records with the expected structure
      
      // Create a moment
      testMoment = await prisma.moment.create({
        data: {
          id: 'testmoment1',
          userId: testUser1.id,
          schoolId: testUser1.schoolId,
          caption: 'Test moment',
        },
      });

      expect(testMoment).toBeDefined();
      expect(testMoment.id).toBe('testmoment1');
      expect(testMoment.userId).toBe(testUser1.id);
    });

    it('should create HypeRound with correct structure', async () => {
      // Create a hype round
      testHypeRound = await prisma.hypeRound.create({
        data: {
          id: 'testhype1',
          userId: testUser1.id,
          schoolId: testUser1.schoolId,
        },
      });

      expect(testHypeRound).toBeDefined();
      expect(testHypeRound.id).toBe('testhype1');
      expect(testHypeRound.userId).toBe(testUser1.id);
    });

    it('should create Post with correct structure', async () => {
      // Create a post
      const testPost = await prisma.post.create({
        data: {
          id: 'testpost1',
          momentId: testMoment.id,
          momentUserId: testMoment.userId,
          imageUrl: 'https://example.com/image.jpg',
          isFront: true,
        },
      });

      expect(testPost).toBeDefined();
      expect(testPost.id).toBe('testpost1');
      expect(testPost.momentId).toBe(testMoment.id);
    });

    it('should create Friendship with correct structure', async () => {
      // Create a friendship
      const testFriendship = await prisma.friendship.create({
        data: {
          id: 'testfriendship1',
          user1Id: testUser1.id,
          user1SchoolId: testUser1.schoolId,
          user2Id: testUser2.id,
          user2SchoolId: testUser2.schoolId,
        },
      });

      expect(testFriendship).toBeDefined();
      expect(testFriendship.id).toBe('testfriendship1');
      expect(testFriendship.user1Id).toBe(testUser1.id);
      expect(testFriendship.user2Id).toBe(testUser2.id);
    });

    it('should create PollVote with correct structure', async () => {
      // Create a poll question first
      const testPollQuestion = await prisma.pollQuestion.create({
        data: {
          text: 'Test question?',
        },
      });

      // Create a poll vote
      const testPollVote = await prisma.pollVote.create({
        data: {
          id: 'testvote1',
          pollQuestionId: testPollQuestion.id,
          voterId: testUser1.id,
          voterSchoolId: testUser1.schoolId,
          recipientId: testUser2.id,
          recipientSchoolId: testUser2.schoolId,
          hypeRoundId: testHypeRound.id,
          hypeRoundUserId: testHypeRound.userId,
        },
      });

      expect(testPollVote).toBeDefined();
      expect(testPollVote.id).toBe('testvote1');
      expect(testPollVote.voterId).toBe(testUser1.id);
      expect(testPollVote.recipientId).toBe(testUser2.id);
    });
  });

  describe('Data Relationships', () => {
    it('should maintain data relationships', async () => {
      // Verify that we can query related data
      const moment = await prisma.moment.findUnique({
        where: {
          id: testMoment.id,
          userId: testMoment.userId,
        },
      });

      expect(moment).toBeDefined();
      expect(moment?.userId).toBe(testUser1.id);
    });

    it('should maintain HypeRound relationships', async () => {
      // Verify that we can query related data
      const hypeRound = await prisma.hypeRound.findUnique({
        where: {
          id: testHypeRound.id,
          userId: testHypeRound.userId,
        },
      });

      expect(hypeRound).toBeDefined();
      expect(hypeRound?.userId).toBe(testUser1.id);
    });

    it('should maintain User relationships', async () => {
      // Verify that we can query related data
      const user = await prisma.user.findUnique({
        where: {
          id: testUser1.id,
          schoolId: testUser1.schoolId,
        },
      });

      expect(user).toBeDefined();
      expect(user?.schoolId).toBe(testSchool.id);
    });
  });

  describe('School-Specific Data', () => {
    it('should support school-specific data isolation', async () => {
      // Create another school
      const anotherSchool = await prisma.school.create({
        data: {
          name: 'Another University',
          domain: 'another2.edu',
        },
      });

      // Create a user in the other school
      const anotherUser = await prisma.user.create({
        data: {
          id: 'anotheruser1',
          email: 'another@test.edu',
          name: 'Another User',
          password: 'password',
          schoolId: anotherSchool.id,
        },
      });

      // Query users for testUser1's school
      const usersInTestSchool = await prisma.user.findMany({
        where: {
          schoolId: testSchool.id,
        },
      });

      // Query users for another school
      const usersInAnotherSchool = await prisma.user.findMany({
        where: {
          schoolId: anotherSchool.id,
        },
      });

      // Verify that we get users only from the specified school
      expect(usersInTestSchool).toBeDefined();
      expect(Array.isArray(usersInTestSchool)).toBe(true);
      expect(usersInTestSchool.find(u => u.id === testUser1.id)).toBeDefined();
      expect(usersInTestSchool.find(u => u.id === anotherUser.id)).toBeUndefined();

      expect(usersInAnotherSchool).toBeDefined();
      expect(Array.isArray(usersInAnotherSchool)).toBe(true);
      expect(usersInAnotherSchool.find(u => u.id === anotherUser.id)).toBeDefined();
      expect(usersInAnotherSchool.find(u => u.id === testUser1.id)).toBeUndefined();
    });
  });
});