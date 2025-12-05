import express from 'express';
import prisma from '../lib/prisma.js';

const router = express.Router();

// GET all work items
router.get('/', async (req, res) => {
  try {
    const workItems = await prisma.workItem.findMany({
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        refinementSession: {
          select: {
            id: true,
            objective: {
              select: {
                id: true,
                title: true,
              },
            },
            project: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(workItems);
  } catch (error) {
    console.error('Error fetching work items:', error);
    res.status(500).json({ error: 'Failed to fetch work items' });
  }
});

export default router;
