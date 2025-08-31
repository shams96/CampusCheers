import { Router } from 'express';
import prisma from '../lib/prisma';
import cacheService from '../lib/cache';

const router = Router();

// Create a moment (School-Specific - Gas App Style)
router.post('/', async (req, res) => {
  const { userId, caption, frontImage, backImage } = req.body;

  if (!userId || !frontImage || !backImage) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  try {
    // Verify user exists and belongs to a school (security check)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        schoolId: true,
        school: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!user || !user.schoolId) {
      return res.status(403).json({
        error: 'User not found or not associated with a school.'
      });
    }

    // Create the moment (automatically isolated to user's school)
    const moment = await prisma.moment.create({
      data: {
        userId,
        caption,
        posts: {
          create: [
            { imageUrl: frontImage, isFront: true },
            { imageUrl: backImage, isFront: false },
          ],
        },
      },
      include: {
        posts: true,
        user: {
          select: {
            id: true,
            name: true,
            school: {
              select: {
                name: true
              }
            }
          }
        }
      },
    });

    console.log(`📸 New moment created: ${userId} (${user.school?.name})`);

    res.status(201).json(moment);
  } catch (error) {
    console.error('Error creating moment:', error);
    res.status(500).json({ error: 'An error occurred while creating the moment.' });
  }
});

// Get moments for a user's school (School-Specific)
router.get('/school-feed', async (req, res) => {
  const { userId } = req.query;

  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ error: 'User ID is required.' });
  }

  try {
    // Get user's school
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { schoolId: true }
    });

    if (!user || !user.schoolId) {
      return res.status(403).json({ error: 'User not found or not associated with a school.' });
    }

    // Try to get school feed from cache first
    const cacheKey = `school-feed:${user.schoolId}`;
    let moments = await cacheService.get(cacheKey);

    if (!moments) {
      // Get moments only from users in the same school
      moments = await prisma.moment.findMany({
        where: {
          user: {
            schoolId: user.schoolId
          }
        },
        include: {
          posts: true,
          user: {
            select: {
              id: true,
              name: true,
              profileImage: true,
              school: {
                select: {
                  name: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 50 // Limit for performance
      });

      // Cache the school feed for 5 minutes (300 seconds)
      await cacheService.set(cacheKey, moments, 300);
    }

    console.log(`📱 School feed loaded: ${moments.length} moments for school ${user.schoolId}`);

    res.json({
      moments,
      schoolId: user.schoolId
    });
  } catch (error) {
    console.error('Error fetching school feed:', error);
    res.status(500).json({ error: 'An error occurred while fetching moments.' });
  }
});

export default router;
