import express from 'express';
import prisma from '../lib/prisma';
import cacheService from '../lib/cache';
import { PollQuestion } from '@prisma/client';
import { generateDynamicPoll } from '../services/ai';

const router = express.Router();

const questions = [
  "Who's the most supportive friend?",
  "Who always makes you laugh?",
  "Who is the best listener?",
  "Who is the most reliable?",
  "Who inspires you the most?",
  "Who is the kindest?",
  "Who is the most creative?",
  "Who always has your back?",
  "Who is the most adventurous?",
  "Who is the best motivator?",
  "Who is the most thoughtful?",
  "Who makes you feel included?",
];

// Internal endpoint to seed the database with poll questions
router.post('/seed-questions', async (req, res) => {
  try {
    await prisma.pollQuestion.createMany({
      data: questions.map((q) => ({ text: q })),
      skipDuplicates: true,
    });
    res.status(201).json({ message: 'Questions seeded successfully' });
  } catch (error) {
    console.error('Error seeding questions:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// Create a new HypeRound record
router.post('/round', async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'Invalid userId' });
  }

  try {
    const hypeRound = await prisma.hypeRound.create({
      data: {
        user: {
          connect: {
            id: userId,
          },
        },
      },
    });
    res.status(201).json(hypeRound);
  } catch (error) {
    console.error('Error creating hype round:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// Get a new Hype Round for a user (School-Specific)
router.get('/', async (req, res) => {
  const { userId } = req.query;

  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ error: 'Invalid userId' });
  }

  try {
    // 1. Verify user belongs to a school
    // Try to get user from cache first
    const userCacheKey = `user:id:${userId}`;
    let user = await cacheService.get(userCacheKey);

    if (!user) {
      user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          schoolId: true,
          school: {
            select: {
              name: true
            }
          }
        }
      });
      
      // Cache the user data for 1 hour (3600 seconds)
      if (user) {
        await cacheService.set(userCacheKey, user, 3600);
      }
    }

    if (!user || !user.schoolId) {
      return res.status(403).json({
        error: 'User not found or not associated with a school.'
      });
    }

    // 2. Get the user's friends (only from the same school)
    let friends = await getSchoolFriends(userId, user.schoolId);

    // If the user has fewer than 4 friends, attempt to seed them.
    // This is a simplified approach for the test user.
    if (friends.length < 4) {
      const userCheck = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true }
      });
      if (userCheck && userCheck.id === 'test-user-id') {
        await seedSchoolFriends(userId, user.schoolId);
        friends = await getSchoolFriends(userId, user.schoolId); // Re-fetch friends
      }
    }

    if (friends.length < 4) {
      return res
        .status(400)
        .json({ error: 'Not enough friends to generate a Hype Round.' });
    }

    // 2. Generate 12 dynamic poll questions using AI
    const selectedQuestions: PollQuestion[] = [];
    for (let i = 0; i < 12; i++) {
      try {
        const aiQuestion = await generateDynamicPoll();
        // Check if question already exists
        let question = await prisma.pollQuestion.findFirst({
          where: { text: aiQuestion }
        });

        // If not, create a new one
        if (!question) {
          question = await prisma.pollQuestion.create({
            data: { text: aiQuestion }
          });
        }

        selectedQuestions.push(question);
      } catch (error) {
        console.error('Error generating AI question:', error);
        // Fallback to existing questions if AI fails
        const fallbackQuestions = await prisma.pollQuestion.findMany();
        if (fallbackQuestions.length > 0) {
          const randomFallback = fallbackQuestions[Math.floor(Math.random() * fallbackQuestions.length)];
          selectedQuestions.push(randomFallback);
        }
      }
    }

    // 3. For each question, select 4 random friends using a weighted algorithm
    const hypeRoundPromises = selectedQuestions.map(async (question: PollQuestion) => {
      const selectedFriends = selectFriendsFairly(friends);

      // Increment the inclusion score for the selected friends
      await Promise.all(selectedFriends.map(friend =>
        prisma.$executeRaw`UPDATE "User" SET "inclusionScore" = "inclusionScore" + 1 WHERE id = ${friend.id}`
      ));

      return {
        question,
        options: selectedFriends.map((friend) => ({
          id: friend.id,
          name: friend.name,
          profileImage: friend.profileImage,
        })),
      };
    });

    const hypeRound = await Promise.all(hypeRoundPromises);

    res.json(hypeRound);
  } catch (error) {
    console.error('Error generating hype round:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// Submit a vote for a poll (School-Specific)
router.post('/vote', async (req, res) => {
  const { voterId, recipientId, pollQuestionId, hypeRoundId } = req.body;

  if (!voterId || !recipientId || !pollQuestionId || !hypeRoundId) {
    return res.status(400).json({ error: 'Invalid request body' });
  }

  try {
    // Verify both users exist and belong to the same school (security check)
    // Try to get users from cache first
    const voterCacheKey = `user:id:${voterId}`;
    const recipientCacheKey = `user:id:${recipientId}`;
    
    let voter = await cacheService.get(voterCacheKey);
    let recipient = await cacheService.get(recipientCacheKey);

    if (!voter || !recipient) {
      const [dbVoter, dbRecipient] = await Promise.all([
        prisma.user.findUnique({
          where: { id: voterId },
          select: { schoolId: true }
        }),
        prisma.user.findUnique({
          where: { id: recipientId },
          select: { schoolId: true }
        })
      ]);
      
      // Update cache with database results
      if (dbVoter) {
        voter = dbVoter;
        await cacheService.set(voterCacheKey, dbVoter, 3600);
      }
      
      if (dbRecipient) {
        recipient = dbRecipient;
        await cacheService.set(recipientCacheKey, dbRecipient, 3600);
      }
    }

    if (!voter || !recipient) {
      return res.status(404).json({ error: 'One or both users not found.' });
    }

    // Ensure both users are from the same school (Gas app style isolation)
    if (voter.schoolId !== recipient.schoolId) {
      return res.status(403).json({
        error: 'You can only vote on polls within your school.'
      });
    }

    const vote = await prisma.pollVote.create({
      data: {
        voterId,
        recipientId,
        pollQuestionId,
        hypeRoundId,
      },
    });

    console.log(`🗳️ Vote recorded: ${voterId} → ${recipientId} (School: ${voter.schoolId})`);

    res.status(201).json(vote);
  } catch (error) {
    console.error('Error submitting vote:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// Endpoint to seed a test user and friends
router.post('/seed-user-and-friends', async (req, res) => {
  try {
    // 1. Create a main user
    const school = await prisma.school.findFirst({
      where: { name: 'Test University' },
    });
    if (!school) {
      throw new Error('Test University not found');
    }
    const mainUser = await prisma.user.create({
      data: {
        id: 'test-user-id',
        name: 'Test User',
        email: 'test@example.com',
        password: 'password', // In a real app, this would be hashed
        school: {
          connect: { id: school.id },
        },
      },
    });

    // 2. Create 4 friend users
    const friendsData = [
      { name: 'Friend 1', email: 'friend1@example.com' },
      { name: 'Friend 2', email: 'friend2@example.com' },
      { name: 'Friend 3', email: 'friend3@example.com' },
      { name: 'Friend 4', email: 'friend4@example.com' },
    ];

    const createdFriends = await Promise.all(
      friendsData.map((friend) =>
        prisma.user.create({
          data: {
            ...friend,
            password: 'password',
            school: {
              connect: { id: school.id },
            },
          },
        })
      )
    );

    // 3. Create friendships
    await prisma.friendship.createMany({
      data: createdFriends.map((friend) => ({
        user1Id: mainUser.id,
        user2Id: friend.id,
      })),
    });

    res.status(201).json({
      message: 'Test user and friends seeded successfully',
      userId: mainUser.id,
    });
  } catch (e) {
    const error = e as any;
    // If the user already exists, just return their ID
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
      const mainUser = await prisma.user.findUnique({
        where: { id: 'test-user-id' },
      });
      if (mainUser) {
        return res.status(200).json({
          message: 'Test user already exists.',
          userId: mainUser.id,
        });
      }
    }
    console.error('Error seeding user and friends:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

function selectFriendsFairly(friends: any[]): any[] {
  // Sort friends by inclusion score, then randomly select from the top 8
  const sortedFriends = friends.sort((a, b) => a.inclusionScore - b.inclusionScore);
  const topFriends = sortedFriends.slice(0, 8);
  const shuffledTopFriends = topFriends.sort(() => 0.5 - Math.random());
  return shuffledTopFriends.slice(0, 4);
}

// Get friends from the same school only (School-Specific)
async function getSchoolFriends(userId: string, schoolId: string) {
  // Try to get friends from cache first
  const friendsCacheKey = `friends:school:${schoolId}:user:${userId}`;
  let friends = await cacheService.get(friendsCacheKey);

  if (!friends) {
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [{ user1Id: userId }, { user2Id: userId }],
      },
      include: {
        user1: {
          include: {
            school: true
          }
        },
        user2: {
          include: {
            school: true
          }
        },
      },
    });

    // Filter to only include friends from the same school
    friends = friendships
      .map((f) => (f.user1Id === userId ? f.user2 : f.user1))
      .filter((friend) => {
        // Only include friends from the same school
        return friend.id !== userId && friend.schoolId === schoolId;
      });
    
    // Cache the friends data for 15 minutes (900 seconds)
    await cacheService.set(friendsCacheKey, friends, 900);
  }

  return friends;
}

// Legacy function for backward compatibility
async function getFriends(userId: string) {
  const friendships = await prisma.friendship.findMany({
    where: {
      OR: [{ user1Id: userId }, { user2Id: userId }],
    },
    include: {
      user1: true,
      user2: true,
    },
  });

  return friendships
    .map((f) => (f.user1Id === userId ? f.user2 : f.user1))
    .filter((friend) => friend.id !== userId);
}

async function seedSchoolFriends(userId: string, schoolId: string) {
  const friendsData = [
    { name: 'Friend 1', email: 'friend1@example.com' },
    { name: 'Friend 2', email: 'friend2@example.com' },
    { name: 'Friend 3', email: 'friend3@example.com' },
    { name: 'Friend 4', email: 'friend4@example.com' },
  ];

  const createdFriends = await Promise.all(
    friendsData.map((friend, index) =>
      prisma.user.upsert({
        where: { id: `friend-${index + 1}` },
        update: {},
        create: {
          id: `friend-${index + 1}`,
          ...friend,
          password: 'password',
          school: {
            connect: { id: schoolId },
          },
        },
      })
    )
  );

  // Create friendships, avoiding duplicates
  for (const friend of createdFriends) {
    await prisma.friendship.upsert({
      where: {
        user1Id_user2Id: {
          user1Id: userId,
          user2Id: friend.id,
        },
      },
      create: {
        user1Id: userId,
        user2Id: friend.id,
      },
      update: {},
    });
  }
  
  // Invalidate cache for the user's friends
  const friendsCacheKey = `friends:school:${schoolId}:user:${userId}`;
  await cacheService.del(friendsCacheKey);
}

// Legacy function for backward compatibility
async function seedFriends(userId: string) {
  const school = await prisma.school.findFirst({
    where: { name: 'Test University' },
  });
  if (!school) {
    throw new Error('Test University not found');
  }

  await seedSchoolFriends(userId, school.id);
}

export default router;
