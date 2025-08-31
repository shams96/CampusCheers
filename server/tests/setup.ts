import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
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

beforeAll(async () => {
  // Reset database schema for tests
  try {
    await prisma.$executeRaw`DROP SCHEMA IF EXISTS public CASCADE;`;
    await prisma.$executeRaw`CREATE SCHEMA public;`;
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
  } catch (error) {
    console.log('Database setup error:', error);
  }
});

afterAll(async () => {
  await prisma.$disconnect();
});

beforeEach(async () => {
  // Clean up data before each test
  const tables = ['PollVote', 'HypeRound', 'Friendship', 'Post', 'Moment', 'PollQuestion', 'User', 'School'];

  for (const table of tables) {
    try {
      await prisma.$executeRaw`TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE;`;
    } catch (error) {
      // Table might not exist, continue
    }
  }
});