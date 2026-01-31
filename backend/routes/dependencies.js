import express from 'express';
import prisma from '../lib/prisma.js';

const router = express.Router();

// GET all dependencies
router.get('/', async (req, res) => {
  try {
    const dependencies = await prisma.objectiveDependency.findMany({
      include: {
        predecessor: {
          select: {
            id: true,
            title: true,
            projectId: true,
            targetDate: true,
          }
        },
        successor: {
          select: {
            id: true,
            title: true,
            projectId: true,
            targetDate: true,
          }
        }
      }
    });

    res.json(dependencies);
  } catch (error) {
    console.error('Error fetching all dependencies:', error);
    res.status(500).json({ error: 'Failed to fetch dependencies' });
  }
});

// GET all dependencies for an objective
router.get('/objective/:objectiveId', async (req, res) => {
  try {
    const { objectiveId } = req.params;
    
    const dependencies = await prisma.objectiveDependency.findMany({
      where: {
        OR: [
          { predecessorId: objectiveId },
          { successorId: objectiveId }
        ]
      },
      include: {
        predecessor: {
          select: {
            id: true,
            title: true,
            projectId: true,
            targetDate: true,
          }
        },
        successor: {
          select: {
            id: true,
            title: true,
            projectId: true,
            targetDate: true,
          }
        }
      }
    });

    res.json(dependencies);
  } catch (error) {
    console.error('Error fetching dependencies:', error);
    res.status(500).json({ error: 'Failed to fetch dependencies' });
  }
});

// GET all dependencies for a project
router.get('/project/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const dependencies = await prisma.objectiveDependency.findMany({
      where: {
        OR: [
          { predecessor: { projectId } },
          { successor: { projectId } }
        ]
      },
      include: {
        predecessor: {
          select: {
            id: true,
            title: true,
            projectId: true,
            targetDate: true,
          }
        },
        successor: {
          select: {
            id: true,
            title: true,
            projectId: true,
            targetDate: true,
          }
        }
      }
    });

    res.json(dependencies);
  } catch (error) {
    console.error('Error fetching project dependencies:', error);
    res.status(500).json({ error: 'Failed to fetch project dependencies' });
  }
});

// Check if adding a dependency would create a circular dependency
async function wouldCreateCircularDependency(predecessorId, successorId) {
  // Use a Set to track visited nodes
  const visited = new Set();
  
  async function hasPath(from, to) {
    if (from === to) return true;
    if (visited.has(from)) return false;
    
    visited.add(from);
    
    // Get all objectives that depend on 'from'
    const dependencies = await prisma.objectiveDependency.findMany({
      where: { predecessorId: from },
      select: { successorId: true }
    });
    
    for (const dep of dependencies) {
      if (await hasPath(dep.successorId, to)) {
        return true;
      }
    }
    
    return false;
  }
  
  // Check if there's already a path from successor to predecessor
  // If so, adding predecessor -> successor would create a cycle
  return await hasPath(successorId, predecessorId);
}

// POST create new dependency
router.post('/', async (req, res) => {
  try {
    const { predecessorId, successorId, type } = req.body;

    // Validate required fields
    if (!predecessorId || !successorId || !type) {
      return res.status(400).json({ 
        error: 'Missing required fields: predecessorId, successorId, type' 
      });
    }

    // Validate dependency type
    const validTypes = ['FS', 'SS', 'FF', 'SF'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ 
        error: 'Invalid dependency type. Must be FS, SS, FF, or SF' 
      });
    }

    // Check if objectives exist
    const [predecessor, successor] = await Promise.all([
      prisma.objective.findUnique({ where: { id: predecessorId } }),
      prisma.objective.findUnique({ where: { id: successorId } })
    ]);

    if (!predecessor || !successor) {
      return res.status(404).json({ error: 'One or both objectives not found' });
    }

    // Check for circular dependency
    const wouldBeCircular = await wouldCreateCircularDependency(predecessorId, successorId);
    if (wouldBeCircular) {
      return res.status(400).json({ 
        error: 'Cannot create dependency: would create a circular dependency' 
      });
    }

    // Check if dependency already exists
    const existing = await prisma.objectiveDependency.findFirst({
      where: {
        predecessorId,
        successorId
      }
    });

    if (existing) {
      return res.status(400).json({ error: 'Dependency already exists' });
    }

    // Create the dependency
    const dependency = await prisma.objectiveDependency.create({
      data: {
        predecessorId,
        successorId,
        type
      },
      include: {
        predecessor: {
          select: {
            id: true,
            title: true,
            projectId: true,
            targetDate: true,
          }
        },
        successor: {
          select: {
            id: true,
            title: true,
            projectId: true,
            targetDate: true,
          }
        }
      }
    });

    res.status(201).json(dependency);
  } catch (error) {
    console.error('Error creating dependency:', error);
    res.status(500).json({ error: 'Failed to create dependency' });
  }
});

// DELETE dependency
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const dependency = await prisma.objectiveDependency.findUnique({
      where: { id }
    });

    if (!dependency) {
      return res.status(404).json({ error: 'Dependency not found' });
    }

    await prisma.objectiveDependency.delete({
      where: { id }
    });

    res.json({ message: 'Dependency deleted successfully' });
  } catch (error) {
    console.error('Error deleting dependency:', error);
    res.status(500).json({ error: 'Failed to delete dependency' });
  }
});

// GET check if objective can be released (all predecessors released)
router.get('/can-release/:objectiveId', async (req, res) => {
  try {
    const { objectiveId } = req.params;

    // Get all FS (Finish-to-Start) dependencies where this objective is the successor
    const dependencies = await prisma.objectiveDependency.findMany({
      where: {
        successorId: objectiveId,
        type: 'FS' // Only check Finish-to-Start dependencies for release
      },
      include: {
        predecessor: {
          include: {
            refinementSessions: {
              select: {
                id: true,
                status: true
              }
            }
          }
        }
      }
    });

    // Check if all predecessor objectives have at least one refinement session (i.e., have been released)
    const unreleased = dependencies.filter(dep => 
      dep.predecessor.refinementSessions.length === 0
    );

    const canRelease = unreleased.length === 0;

    res.json({
      canRelease,
      blockedBy: unreleased.map(dep => ({
        id: dep.predecessor.id,
        title: dep.predecessor.title,
        projectId: dep.predecessor.projectId
      }))
    });
  } catch (error) {
    console.error('Error checking release status:', error);
    res.status(500).json({ error: 'Failed to check release status' });
  }
});

export default router;
