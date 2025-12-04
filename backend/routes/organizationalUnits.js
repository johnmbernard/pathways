import express from 'express';
import prisma from '../lib/prisma.js';

const router = express.Router();

// GET all organizational units with their hierarchy
router.get('/', async (req, res) => {
  try {
    const units = await prisma.organizationalUnit.findMany({
      include: {
        parent: {
          select: {
            id: true,
            name: true,
          },
        },
        children: {
          select: {
            id: true,
            name: true,
            tier: true,
          },
        },
      },
      orderBy: {
        tier: 'asc',
      },
    });

    res.json(units);
  } catch (error) {
    console.error('Error fetching organizational units:', error);
    res.status(500).json({ error: 'Failed to fetch organizational units' });
  }
});

// GET single organizational unit by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const unit = await prisma.organizationalUnit.findUnique({
      where: { id },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
          },
        },
        children: {
          select: {
            id: true,
            name: true,
            tier: true,
          },
        },
      },
    });

    if (!unit) {
      return res.status(404).json({ error: 'Organizational unit not found' });
    }

    res.json(unit);
  } catch (error) {
    console.error('Error fetching organizational unit:', error);
    res.status(500).json({ error: 'Failed to fetch organizational unit' });
  }
});

// POST create new organizational unit
router.post('/', async (req, res) => {
  try {
    const { id, name, tier, parentId } = req.body;

    // Validate required fields
    if (!id || !name || tier === undefined) {
      return res.status(400).json({ error: 'Missing required fields: id, name, tier' });
    }

    // Validate tier is a positive integer
    if (typeof tier !== 'number' || tier < 1 || !Number.isInteger(tier)) {
      return res.status(400).json({ error: 'Tier must be a positive integer (1, 2, 3, ...)' });
    }

    // If parentId provided, verify parent exists
    if (parentId) {
      const parentUnit = await prisma.organizationalUnit.findUnique({
        where: { id: parentId },
      });

      if (!parentUnit) {
        return res.status(404).json({ error: 'Parent unit not found' });
      }

      // Validate tier hierarchy (parent must have lower tier)
      if (parentUnit.tier >= tier) {
        return res.status(400).json({ error: 'Parent unit must have a lower tier number' });
      }
    }

    const unit = await prisma.organizationalUnit.create({
      data: {
        id,
        name,
        tier,
        parentId: parentId || null,
      },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.status(201).json(unit);
  } catch (error) {
    console.error('Error creating organizational unit:', error);
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Organizational unit with this ID already exists' });
    }
    res.status(500).json({ error: 'Failed to create organizational unit' });
  }
});

// PUT update organizational unit
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, tier, parentId } = req.body;

    // Check if unit exists
    const existingUnit = await prisma.organizationalUnit.findUnique({
      where: { id },
    });

    if (!existingUnit) {
      return res.status(404).json({ error: 'Organizational unit not found' });
    }

    // Build update data
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (tier !== undefined) {
      if (typeof tier !== 'number' || tier < 1 || !Number.isInteger(tier)) {
        return res.status(400).json({ error: 'Tier must be a positive integer (1, 2, 3, ...)' });
      }
      updateData.tier = tier;
    }
    if (parentId !== undefined) {
      if (parentId === null) {
        updateData.parentId = null;
      } else {
        // Verify parent exists
        const parentUnit = await prisma.organizationalUnit.findUnique({
          where: { id: parentId },
        });

        if (!parentUnit) {
          return res.status(404).json({ error: 'Parent unit not found' });
        }

        // Prevent circular references
        if (parentId === id) {
          return res.status(400).json({ error: 'Unit cannot be its own parent' });
        }

        updateData.parentId = parentId;
      }
    }

    const unit = await prisma.organizationalUnit.update({
      where: { id },
      data: updateData,
      include: {
        parent: {
          select: {
            id: true,
            name: true,
          },
        },
        children: {
          select: {
            id: true,
            name: true,
            tier: true,
          },
        },
      },
    });

    res.json(unit);
  } catch (error) {
    console.error('Error updating organizational unit:', error);
    res.status(500).json({ error: 'Failed to update organizational unit' });
  }
});

// DELETE organizational unit
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if unit exists
    const unit = await prisma.organizationalUnit.findUnique({
      where: { id },
      include: {
        children: true,
        users: true,
      },
    });

    if (!unit) {
      return res.status(404).json({ error: 'Organizational unit not found' });
    }

    // Prevent deletion if unit has children
    if (unit.children.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete unit with child units. Remove or reassign children first.' 
      });
    }

    // Prevent deletion if unit has users
    if (unit.users.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete unit with assigned users. Reassign users first.' 
      });
    }

    await prisma.organizationalUnit.delete({
      where: { id },
    });

    res.json({ message: 'Organizational unit deleted successfully' });
  } catch (error) {
    console.error('Error deleting organizational unit:', error);
    res.status(500).json({ error: 'Failed to delete organizational unit' });
  }
});

export default router;
