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

// POST create a new work item
router.post('/', async (req, res) => {
  try {
    const { title, description, type, priority, status, assignedOrgUnit, estimatedEffort, createdBy } = req.body;

    console.log('Creating work item with data:', { title, assignedOrgUnit, createdBy });

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    if (!assignedOrgUnit) {
      return res.status(400).json({ error: 'assignedOrgUnit is required - all work items must be assigned to a leaf unit' });
    }

    // Get a default user if createdBy not provided
    let userIdToUse = createdBy;
    if (!userIdToUse) {
      const defaultUser = await prisma.user.findFirst();
      if (!defaultUser) {
        return res.status(500).json({ error: 'No users found in database' });
      }
      userIdToUse = defaultUser.id;
      console.log('Using default user:', userIdToUse);
    }

    // Validate user exists
    const user = await prisma.user.findUnique({
      where: { id: userIdToUse }
    });
    if (!user) {
      console.error('User not found:', userIdToUse);
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    // Validate org unit exists and is a leaf unit (has no children)
    const orgUnit = await prisma.organizationalUnit.findUnique({
      where: { id: assignedOrgUnit }
    });
    if (!orgUnit) {
      return res.status(400).json({ error: 'Invalid organizational unit ID' });
    }
    
    // Check if this is a leaf unit by seeing if it has any children
    const childUnits = await prisma.organizationalUnit.findMany({
      where: { parentId: assignedOrgUnit },
      take: 1 // Just need to know if any exist
    });
    
    if (childUnits.length > 0) {
      return res.status(400).json({ 
        error: 'Work items can only be assigned to leaf units (units with no subordinates)' 
      });
    }

    const workItem = await prisma.workItem.create({
      data: {
        title,
        description: description || '',
        type: type || 'Work Item',
        priority: priority || 'P3',
        stackRank: 0,
        status: status || 'Backlog',
        assignedOrgUnit: assignedOrgUnit,
        estimatedEffort: estimatedEffort ? parseFloat(estimatedEffort) : null,
        createdBy: userIdToUse,
      },
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
    });

    res.status(201).json(workItem);
  } catch (error) {
    console.error('Error creating work item:', error);
    res.status(500).json({ error: 'Failed to create work item' });
  }
});

// PATCH update a work item
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Only allow certain fields to be updated
    const allowedUpdates = {
      title: updates.title,
      description: updates.description,
      type: updates.type,
      priority: updates.priority,
      stackRank: updates.stackRank,
      status: updates.status,
      assignedOrgUnit: updates.assignedOrgUnit,
      estimatedEffort: updates.estimatedEffort,
      completedAt: updates.completedAt,
    };

    // Remove undefined values
    Object.keys(allowedUpdates).forEach(key => 
      allowedUpdates[key] === undefined && delete allowedUpdates[key]
    );

    const updatedItem = await prisma.workItem.update({
      where: { id },
      data: allowedUpdates,
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
    });

    res.json(updatedItem);
  } catch (error) {
    console.error('Error updating work item:', error);
    res.status(500).json({ error: 'Failed to update work item' });
  }
});

export default router;
