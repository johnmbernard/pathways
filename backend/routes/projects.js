import express from 'express';
import prisma from '../lib/prisma.js';

const router = express.Router();

// GET all projects with their objectives
router.get('/', async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      include: {
        objectives: {
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
            completedByUnits: true,
          },
        },
        risks: true,
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// GET single project by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        objectives: {
          include: {
            assignedUnits: {
              include: {
                unit: true,
              },
            },
            completedByUnits: true,
          },
        },
        risks: true,
        creator: true,
      },
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Debug: Log objectives to see what fields are being returned
    if (project.objectives && project.objectives.length > 0) {
      console.log('Sample objective fields:', Object.keys(project.objectives[0]));
      console.log('Sample objective data:', project.objectives[0]);
    }

    res.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// POST create new project
router.post('/', async (req, res) => {
  try {
    const {
      title,
      description,
      owner,
      ownerUnit,
      ownerTier,
      status,
      startDate,
      targetDate,
      budget,
      notes,
      createdBy,
    } = req.body;

    // Validate required fields
    if (!title || !ownerUnit || !ownerTier || !createdBy) {
      return res.status(400).json({ 
        error: 'Missing required fields: title, ownerUnit, ownerTier, createdBy' 
      });
    }

    const project = await prisma.project.create({
      data: {
        title,
        description,
        owner,
        ownerUnit,
        ownerTier,
        status: status || 'Planning',
        startDate,
        targetDate,
        budget: budget || 0,
        notes,
        createdBy,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.status(201).json(project);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// PUT update project
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      owner,
      ownerUnit,
      ownerTier,
      status,
      startDate,
      targetDate,
      budget,
      notes,
    } = req.body;

    // Check if project exists
    const existingProject = await prisma.project.findUnique({
      where: { id },
    });

    if (!existingProject) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Build update data
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (owner !== undefined) updateData.owner = owner;
    if (ownerUnit !== undefined) updateData.ownerUnit = ownerUnit;
    if (ownerTier !== undefined) updateData.ownerTier = ownerTier;
    if (status !== undefined) updateData.status = status;
    if (startDate !== undefined) updateData.startDate = startDate;
    if (targetDate !== undefined) updateData.targetDate = targetDate;
    if (budget !== undefined) updateData.budget = budget;
    if (notes !== undefined) updateData.notes = notes;

    const project = await prisma.project.update({
      where: { id },
      data: updateData,
      include: {
        objectives: {
          include: {
            assignedUnits: {
              include: {
                unit: true,
              },
            },
            completedByUnits: true,
          },
        },
        risks: true,
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.json(project);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// DELETE project
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Delete project (cascade will handle objectives, risks, etc.)
    await prisma.project.delete({
      where: { id },
    });

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

export default router;
