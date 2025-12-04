import express from 'express';
import prisma from '../lib/prisma.js';

const router = express.Router();

// GET all refinement sessions
router.get('/', async (req, res) => {
  try {
    const sessions = await prisma.refinementSession.findMany({
      include: {
        project: {
          select: {
            id: true,
            title: true,
            ownerTier: true,
          },
        },
        objective: {
          select: {
            id: true,
            title: true,
            description: true,
            targetDate: true,
            assignedUnits: {
              include: {
                unit: {
                  select: {
                    id: true,
                    name: true,
                    tier: true,
                  },
                },
              },
            },
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        unitCompletions: {
          include: {
            organizationalUnit: {
              select: {
                id: true,
                name: true,
                tier: true,
              },
            },
            completedByUser: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        workItems: {
          include: {
            creator: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        refinedObjectives: true,
        discussionMessages: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Parse assignedUnits JSON strings in refinedObjectives
    const sessionsWithParsedData = sessions.map(session => ({
      ...session,
      refinedObjectives: session.refinedObjectives?.map(obj => ({
        ...obj,
        assignedUnits: JSON.parse(obj.assignedUnits || '[]'),
      })) || [],
    }));

    res.json(sessionsWithParsedData);
  } catch (error) {
    console.error('Error fetching refinement sessions:', error);
    res.status(500).json({ error: 'Failed to fetch refinement sessions' });
  }
});

// GET refinement session by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const session = await prisma.refinementSession.findUnique({
      where: { id },
      include: {
        project: true,
        objective: {
          include: {
            assignments: {
              include: {
                organizationalUnit: {
                  select: {
                    id: true,
                    name: true,
                    tier: true,
                  },
                },
              },
            },
          },
        },
        creator: true,
        unitCompletions: {
          include: {
            organizationalUnit: {
              select: {
                id: true,
                name: true,
                tier: true,
              },
            },
            completedByUser: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        workItems: {
          include: {
            creator: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        refinedObjectives: true,
        discussionMessages: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!session) {
      return res.status(404).json({ error: 'Refinement session not found' });
    }

    // Parse assignedUnits JSON strings in refinedObjectives
    const sessionWithParsedData = {
      ...session,
      refinedObjectives: session.refinedObjectives?.map(obj => ({
        ...obj,
        assignedUnits: JSON.parse(obj.assignedUnits || '[]'),
      })) || [],
    };

    res.json(sessionWithParsedData);
  } catch (error) {
    console.error('Error fetching refinement session:', error);
    res.status(500).json({ error: 'Failed to fetch refinement session' });
  }
});

// POST create new refinement session (collaborative - one per objective)
router.post('/', async (req, res) => {
  try {
    const {
      projectId,
      objectiveId,
      createdBy,
    } = req.body;

    // Validate required fields
    if (!projectId || !objectiveId || !createdBy) {
      return res.status(400).json({ 
        error: 'Missing required fields: projectId, objectiveId, createdBy' 
      });
    }

    // Check if session already exists for this project+objective combination
    const existingSession = await prisma.refinementSession.findUnique({
      where: {
        projectId_objectiveId: {
          projectId,
          objectiveId,
        },
      },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            ownerTier: true,
          },
        },
        objective: {
          select: {
            id: true,
            title: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        unitCompletions: {
          include: {
            organizationalUnit: {
              select: {
                id: true,
                name: true,
                tier: true,
              },
            },
            completedByUser: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (existingSession) {
      // Return existing session instead of creating duplicate
      return res.status(200).json(existingSession);
    }

    // Create new collaborative session
    const session = await prisma.refinementSession.create({
      data: {
        projectId,
        objectiveId,
        status: 'in-progress',
        createdBy,
      },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            ownerTier: true,
          },
        },
        objective: {
          select: {
            id: true,
            title: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        unitCompletions: {
          include: {
            organizationalUnit: {
              select: {
                id: true,
                name: true,
                tier: true,
              },
            },
            completedByUser: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    res.status(201).json(session);
  } catch (error) {
    console.error('Error creating refinement session:', error);
    res.status(500).json({ error: 'Failed to create refinement session' });
  }
});

// PUT update refinement session
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Check if session exists
    const existingSession = await prisma.refinementSession.findUnique({
      where: { id },
    });

    if (!existingSession) {
      return res.status(404).json({ error: 'Refinement session not found' });
    }

    const session = await prisma.refinementSession.update({
      where: { id },
      data: {
        status: status || existingSession.status,
      },
      include: {
        project: true,
        objective: true,
        organizationalUnit: true,
        workItems: true,
        refinedObjectives: true,
        discussionMessages: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    res.json(session);
  } catch (error) {
    console.error('Error updating refinement session:', error);
    res.status(500).json({ error: 'Failed to update refinement session' });
  }
});

// POST add work item to refinement session
router.post('/:id/work-items', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      type,
      priority,
      estimatedEffort,
      assignedOrgUnit,
      createdBy,
    } = req.body;

    if (!title || !createdBy) {
      return res.status(400).json({ 
        error: 'Missing required fields: title, createdBy' 
      });
    }

    const workItem = await prisma.workItem.create({
      data: {
        title,
        description,
        type: type || 'Story',
        priority: priority || 'Medium',
        estimatedEffort,
        assignedOrgUnit,
        status: 'Backlog',
        refinementSessionId: id,
        createdBy,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
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

// PUT update work item
router.put('/:sessionId/work-items/:workItemId', async (req, res) => {
  try {
    const { workItemId } = req.params;
    const updates = req.body;

    const workItem = await prisma.workItem.update({
      where: { id: workItemId },
      data: updates,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.json(workItem);
  } catch (error) {
    console.error('Error updating work item:', error);
    res.status(500).json({ error: 'Failed to update work item' });
  }
});

// DELETE work item
router.delete('/:sessionId/work-items/:workItemId', async (req, res) => {
  try {
    const { workItemId } = req.params;

    await prisma.workItem.delete({
      where: { id: workItemId },
    });

    res.json({ message: 'Work item deleted successfully' });
  } catch (error) {
    console.error('Error deleting work item:', error);
    res.status(500).json({ error: 'Failed to delete work item' });
  }
});

// POST add refined objective to session
router.post('/:id/refined-objectives', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, targetDate, assignedUnits } = req.body;

    if (!title || !targetDate) {
      return res.status(400).json({ 
        error: 'Missing required fields: title, targetDate' 
      });
    }

    const refinedObjective = await prisma.refinedObjective.create({
      data: {
        title,
        description,
        targetDate,
        assignedUnits: JSON.stringify(assignedUnits || []),
        refinementSessionId: id,
      },
    });
    
    // Parse assignedUnits back to array for response
    const response = {
      ...refinedObjective,
      assignedUnits: JSON.parse(refinedObjective.assignedUnits),
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Error creating refined objective:', error);
    res.status(500).json({ error: 'Failed to create refined objective' });
  }
});

// POST add discussion message
router.post('/:id/messages', async (req, res) => {
  try {
    const { id } = req.params;
    const { content, authorId } = req.body;

    if (!content || !authorId) {
      return res.status(400).json({ 
        error: 'Missing required fields: content, authorId' 
      });
    }

    const message = await prisma.discussionMessage.create({
      data: {
        content,
        authorId,
        refinementSessionId: id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.status(201).json(message);
  } catch (error) {
    console.error('Error creating discussion message:', error);
    res.status(500).json({ error: 'Failed to create discussion message' });
  }
});

// POST mark unit as complete for a refinement session
router.post('/:id/complete-unit', async (req, res) => {
  try {
    const { id } = req.params;
    const { organizationalUnitId, completedBy } = req.body;

    if (!organizationalUnitId || !completedBy) {
      return res.status(400).json({ 
        error: 'Missing required fields: organizationalUnitId, completedBy' 
      });
    }

    // Check if session exists
    const session = await prisma.refinementSession.findUnique({
      where: { id },
    });

    if (!session) {
      return res.status(404).json({ error: 'Refinement session not found' });
    }

    // Check if completion already exists
    const existing = await prisma.refinementUnitCompletion.findUnique({
      where: {
        refinementSessionId_organizationalUnitId: {
          refinementSessionId: id,
          organizationalUnitId,
        },
      },
    });

    if (existing) {
      // Update existing completion
      const updated = await prisma.refinementUnitCompletion.update({
        where: {
          refinementSessionId_organizationalUnitId: {
            refinementSessionId: id,
            organizationalUnitId,
          },
        },
        data: {
          completedBy,
          completedAt: new Date(),
        },
        include: {
          organizationalUnit: {
            select: {
              id: true,
              name: true,
              tier: true,
            },
          },
          completedByUser: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
      return res.json(updated);
    }

    // Create new completion
    const completion = await prisma.refinementUnitCompletion.create({
      data: {
        refinementSessionId: id,
        organizationalUnitId,
        completedBy,
      },
      include: {
        organizationalUnit: {
          select: {
            id: true,
            name: true,
            tier: true,
          },
        },
        completedByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.status(201).json(completion);
  } catch (error) {
    console.error('Error marking unit complete:', error);
    res.status(500).json({ error: 'Failed to mark unit complete' });
  }
});

// DELETE remove unit completion (allow re-work)
router.delete('/:id/complete-unit/:unitId', async (req, res) => {
  try {
    const { id, unitId } = req.params;

    const completion = await prisma.refinementUnitCompletion.findUnique({
      where: {
        refinementSessionId_organizationalUnitId: {
          refinementSessionId: id,
          organizationalUnitId: unitId,
        },
      },
    });

    if (!completion) {
      return res.status(404).json({ error: 'Unit completion not found' });
    }

    await prisma.refinementUnitCompletion.delete({
      where: {
        refinementSessionId_organizationalUnitId: {
          refinementSessionId: id,
          organizationalUnitId: unitId,
        },
      },
    });

    res.json({ message: 'Unit completion removed successfully' });
  } catch (error) {
    console.error('Error removing unit completion:', error);
    res.status(500).json({ error: 'Failed to remove unit completion' });
  }
});

// DELETE refinement session
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const session = await prisma.refinementSession.findUnique({
      where: { id },
    });

    if (!session) {
      return res.status(404).json({ error: 'Refinement session not found' });
    }

    await prisma.refinementSession.delete({
      where: { id },
    });

    res.json({ message: 'Refinement session deleted successfully' });
  } catch (error) {
    console.error('Error deleting refinement session:', error);
    res.status(500).json({ error: 'Failed to delete refinement session' });
  }
});

export default router;
