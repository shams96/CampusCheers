import { Router } from 'express';
import prisma from '../lib/prisma';
import cacheService from '../lib/cache';

const router = Router();

// Get cheers received by a user
router.get('/', async (req, res) => {
  const { userId } = req.query;

  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ error: 'Valid userId is required' });
  }

  // Try to get results from cache first
  const cacheKey = `results:${userId}`;
  try {
    const cachedResults = await cacheService.get(cacheKey);
    if (cachedResults) {
      return res.json(cachedResults);
    }
  } catch (error) {
    console.error('Cache get error:', error);
  }

  try {
    // Get all votes received by the user
    const receivedVotes = await prisma.pollVote.findMany({
      where: {
        recipientId: userId,
      },
      include: {
        pollQuestion: true,
        voter: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Group votes by poll question
    const cheersByQuestion = receivedVotes.reduce((acc, vote) => {
      const questionId = vote.pollQuestionId;
      if (!acc[questionId]) {
        acc[questionId] = {
          id: questionId,
          question: vote.pollQuestion.text,
          votes: 0,
          pollQuestionId: questionId,
        };
      }
      acc[questionId].votes += 1;
      return acc;
    }, {} as Record<string, { id: string; question: string; votes: number; pollQuestionId: string }>);

    const cheers = Object.values(cheersByQuestion);

    // Cache the results for 1 hour
    try {
      await cacheService.set(cacheKey, cheers, 3600);
    } catch (error) {
      console.error('Cache set error:', error);
    }

    res.json(cheers);
  } catch (error) {
    console.error('Error fetching results:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

export default router;