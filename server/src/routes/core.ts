import { Router } from 'express';
import prisma from '../lib/prisma';
import cacheService from '../lib/cache';

const router = Router();


// Search for users (School-Specific - Gas App Style)
router.get('/users/search', async (req, res) => {
  const { query, userId, schoolId } = req.query;

  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'A search query is required.' });
  }

  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ error: 'A userId is required.' });
  }

  if (!schoolId || typeof schoolId !== 'string') {
    return res.status(400).json({ error: 'A schoolId is required for school-specific search.' });
  }

  try {
    // First, verify the user belongs to the specified school (security check)
    // Try to get user from cache first
    const userCacheKey = `user:id:${userId}`;
    let currentUser = await cacheService.get(userCacheKey);

    if (!currentUser) {
      currentUser = await prisma.user.findUnique({
        where: {
          id_schoolId: {
            id: userId,
            schoolId: schoolId
          }
        } as any, // Temporary fix for composite key
        select: { schoolId: true }
      });

      // Cache the user data for 1 hour (3600 seconds)
      if (currentUser) {
        await cacheService.set(userCacheKey, currentUser, 3600);
      }
    }

    if (!currentUser) {
      return res.status(403).json({ error: 'User not found.' });
    }

    if (currentUser.schoolId !== schoolId) {
      return res.status(403).json({ error: 'Access denied. You can only search within your school.' });
    }

    // Search for users within the same school only
    const users = await prisma.user.findMany({
      where: {
        AND: [
          {
            name: {
              contains: query,
              mode: 'insensitive',
            }
          },
          {
            schoolId: schoolId, // Only users from the same school
          },
          {
            id: {
              not: userId, // Exclude the current user
            }
          }
        ]
      },
      select: {
        id: true,
        name: true,
        profileImage: true,
        // grade: true, // TODO: Add after migration
      },
      orderBy: {
        name: 'asc' // Alphabetical order for better UX
      },
      take: 20 // Limit results for performance
    });

    console.log(`🔍 School-specific search: Found ${users.length} users for "${query}" in school ${schoolId}`);

    res.json(users);
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ error: 'An error occurred while searching for users.' });
  }
});

// Add a friend (School-Specific - Gas App Style)
router.post('/friends/add', async (req, res) => {
  const { userId, friendId, schoolId } = req.body;

  if (!userId || !friendId) {
    return res.status(400).json({ error: 'Both userId and friendId are required.' });
  }

  try {
    // Verify both users exist and belong to the same school (security check)
    // Try to get users from cache first
    const currentUserCacheKey = `user:id:${userId}`;
    const friendUserCacheKey = `user:id:${friendId}`;

    let currentUser = await cacheService.get(currentUserCacheKey);
    let friendUser = await cacheService.get(friendUserCacheKey);

    if (!currentUser || !friendUser) {
      const [dbCurrentUser, dbFriendUser] = await Promise.all([
        prisma.user.findUnique({
          where: {
            id_schoolId: {
              id: userId,
              schoolId: schoolId
            }
          } as any, // Temporary fix for composite key
          select: { schoolId: true }
        }),
        prisma.user.findUnique({
          where: {
            id_schoolId: {
              id: friendId,
              schoolId: schoolId
            }
          } as any, // Temporary fix for composite key
          select: { schoolId: true }
        })
      ]);

      // Update cache with database results
      if (dbCurrentUser) {
        currentUser = dbCurrentUser;
        await cacheService.set(currentUserCacheKey, dbCurrentUser, 3600);
      }

      if (dbFriendUser) {
        friendUser = dbFriendUser;
        await cacheService.set(friendUserCacheKey, dbFriendUser, 3600);
      }
    }

    if (!currentUser || !friendUser) {
      return res.status(404).json({ error: 'One or both users not found.' });
    }

    // Ensure both users are from the same school (Gas app style isolation)
    if (currentUser.schoolId !== friendUser.schoolId) {
      return res.status(403).json({
        error: 'You can only connect with students from your school.'
      });
    }

    // Additional security: verify the schoolId matches (if provided)
    if (schoolId && currentUser.schoolId !== schoolId) {
      return res.status(403).json({
        error: 'School verification failed.'
      });
    }

    // Ensure users are not already friends
    const existingFriendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { user1Id: userId, user2Id: friendId },
          { user1Id: friendId, user2Id: userId },
        ],
      },
    });

    if (existingFriendship) {
      return res.status(409).json({ message: 'You are already friends with this user.' });
    }

    // Create the friendship using unchecked create for now
    const friendship = await prisma.friendship.create({
      data: {
        id: Date.now().toString(),
        user1Id: userId,
        user2Id: friendId,
      } as any // Temporary workaround for schema update
    });

    console.log(`🤝 New friendship created: ${userId} ↔ ${friendId} (School: ${currentUser.schoolId})`);

    // Invalidate cache for both users since their friendship status has changed
    const friendshipUserCacheKey1 = `user:id:${userId}`;
    const friendshipUserCacheKey2 = `user:id:${friendId}`;
    await cacheService.del(friendshipUserCacheKey1);
    await cacheService.del(friendshipUserCacheKey2);

    res.status(201).json({
      message: 'Friend added successfully!',
      friendship
    });
  } catch (error) {
    console.error('Error adding friend:', error);
    res.status(500).json({ error: 'An error occurred while adding a friend.' });
  }
});

// Seed the database with test users
router.post('/seed', async (req, res) => {
  try {
    // Create a test school if it doesn't exist
    let school = await prisma.school.findUnique({ where: { domain: 'test.edu' } });
    if (!school) {
      school = await prisma.school.create({
        data: {
          name: 'Test University',
          domain: 'test.edu',
        },
      });
    }

    // Create test users
    const user1 = await prisma.user.upsert({
      where: {
        id_schoolId: {
          id: 'testuser1',
          schoolId: school.id
        }
      } as any, // Temporary fix for composite key
      update: {},
      create: {
        id: 'testuser1',
        email: 'testuser1@test.edu',
        name: 'Test User One',
        password: 'password',
        schoolId: school.id,
        phoneNumber: '5551000001',
        grade: 11,
        isVerified: true
      } as any
    });
    const user2 = await prisma.user.upsert({
      where: {
        id_schoolId: {
          id: 'testuser2',
          schoolId: school.id
        }
      } as any, // Temporary fix for composite key
      update: {},
      create: {
        id: 'testuser2',
        email: 'testuser2@test.edu',
        name: 'Test User Two',
        password: 'password',
        schoolId: school.id,
        phoneNumber: '5551000002',
        grade: 11,
        isVerified: true
      } as any
    });
    const user3 = await prisma.user.upsert({
      where: {
        id_schoolId: {
          id: 'anotheruser',
          schoolId: school.id
        }
      } as any, // Temporary fix for composite key
      update: {},
      create: {
        id: 'anotheruser',
        email: 'anotheruser@test.edu',
        name: 'Another Test',
        password: 'password',
        schoolId: school.id,
        phoneNumber: '5551000003',
        grade: 10,
        isVerified: true
      } as any
    });

    // Invalidate cache for the test school
    const schoolCacheKey = `school:id:${school.id}`;
    await cacheService.del(schoolCacheKey);
    
    // Invalidate cache for all users
    const userCacheKeys = [`user:id:${user1.id}`, `user:id:${user2.id}`, `user:id:${user3.id}`];
    for (const key of userCacheKeys) {
      await cacheService.del(key);
    }

    res.status(200).json({ message: 'Database seeded successfully.', users: [user1, user2, user3] });
  } catch (error) {
    console.error('Error seeding database:', error);
    res.status(500).json({ error: 'An error occurred while seeding the database.' });
  }
});

export default router;
