import express from 'express';
import prisma from '../lib/prisma.js';

const router = express.Router();

// GET objectives for a project
router.get('/project/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const objectives = await prisma.objective.findMany({
      where: { projectId },
      include: {
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
        completedByUnits: {
          include: {
            unit: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        dependenciesFrom: {
          include: {
            successor: {
              select: {
                id: true,
                title: true,
              }
            }
          }
        },
        dependenciesTo: {
          include: {
            predecessor: {
              select: {
                id: true,
                title: true,
              }
            }
          }
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    res.json(objectives);
  } catch (error) {
    console.error('Error fetching objectives:', error);
    res.status(500).json({ error: 'Failed to fetch objectives' });
  }
});

// POST create new objective
router.post('/', async (req, res) => {
  try {
    const {
      title,
      description,
      targetDate,
      projectId,
      fromTier,
      assignedUnits, // Array of unit IDs
      createdBy,
    } = req.body;

    // Validate required fields
    if (!title || !targetDate || !projectId || !createdBy) {
      return res.status(400).json({ 
        error: 'Missing required fields: title, targetDate, projectId, createdBy' 
      });
    }

    // Create objective with assignments
    const objective = await prisma.objective.create({
      data: {
        title,
        description,
        targetDate,
        fromTier: fromTier || 1,
        projectId,
        createdBy,
        assignedUnits: assignedUnits && assignedUnits.length > 0 ? {
          create: assignedUnits.map(unitId => ({
            unitId,
          })),
        } : undefined,
      },
      include: {
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
    });

    res.status(201).json(objective);
  } catch (error) {
    console.error('Error creating objective:', error);
    res.status(500).json({ error: 'Failed to create objective' });
  }
});

// PUT update objective
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, dueDate, assignedUnits } = req.body;

    // Check if objective exists
    const existingObjective = await prisma.objective.findUnique({
      where: { id },
    });

    if (!existingObjective) {
      return res.status(404).json({ error: 'Objective not found' });
    }

    // Build update data
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (dueDate !== undefined) updateData.dueDate = dueDate;

    // Handle assigned units update
    if (assignedUnits !== undefined) {
      // Delete existing assignments and create new ones
      await prisma.objectiveAssignment.deleteMany({
        where: { objectiveId: id },
      });

      if (assignedUnits.length > 0) {
        updateData.assignedUnits = {
          create: assignedUnits.map(unitId => ({
            unitId,
          })),
        };
      }
    }

    const objective = await prisma.objective.update({
      where: { id },
      data: updateData,
      include: {
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
        completedByUnits: {
          include: {
            unit: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    res.json(objective);
  } catch (error) {
    console.error('Error updating objective:', error);
    res.status(500).json({ error: 'Failed to update objective' });
  }
});

// DELETE objective
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if objective exists
    const objective = await prisma.objective.findUnique({
      where: { id },
    });

    if (!objective) {
      return res.status(404).json({ error: 'Objective not found' });
    }

    // Delete objective (cascade will handle assignments and completions)
    await prisma.objective.delete({
      where: { id },
    });

    res.json({ message: 'Objective deleted successfully' });
  } catch (error) {
    console.error('Error deleting objective:', error);
    res.status(500).json({ error: 'Failed to delete objective' });
  }
});

// POST mark objective as complete for a unit
router.post('/:id/complete', async (req, res) => {
  try {
    const { id } = req.params;
    const { unitId } = req.body;

    if (!unitId) {
      return res.status(400).json({ error: 'Missing required field: unitId' });
    }

    // Check if already completed
    const existing = await prisma.objectiveCompletion.findUnique({
      where: {
        objectiveId_unitId: {
          objectiveId: id,
          unitId,
        },
      },
    });

    if (existing) {
      return res.status(400).json({ error: 'Objective already completed for this unit' });
    }

    const completion = await prisma.objectiveCompletion.create({
      data: {
        objectiveId: id,
        unitId,
      },
    });

    res.status(201).json(completion);
  } catch (error) {
    console.error('Error marking objective complete:', error);
    res.status(500).json({ error: 'Failed to mark objective complete' });
  }
});

// DELETE remove completion for a unit
router.delete('/:id/complete/:unitId', async (req, res) => {
  try {
    const { id, unitId } = req.params;

    await prisma.objectiveCompletion.delete({
      where: {
        objectiveId_unitId: {
          objectiveId: id,
          unitId,
        },
      },
    });

    res.json({ message: 'Completion removed successfully' });
  } catch (error) {
    console.error('Error removing completion:', error);
    res.status(500).json({ error: 'Failed to remove completion' });
  }
});

export default router;
