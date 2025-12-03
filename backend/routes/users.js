import express from 'express';
const router = express.Router();

// In-memory user storage (same as auth.js - should be shared in production)
let users = [
  {
    id: 'user-1',
    email: 'kessel.lead@pathways.dev',
    password: 'demo123',
    name: 'Kessel Lead',
    organizationalUnit: 'unit-1',
    role: 'Unit Leader',
  },
  {
    id: 'user-2',
    email: 'opsc2.lead@pathways.dev',
    password: 'demo123',
    name: 'OpsC2 Lead',
    organizationalUnit: 'unit-2',
    role: 'Unit Leader',
  },
  {
    id: 'user-3',
    email: 'krados.lead@pathways.dev',
    password: 'demo123',
    name: 'KRADOS Team Lead',
    organizationalUnit: 'unit-3',
    role: 'Team Lead',
  },
  {
    id: 'user-4',
    email: 'wingc2.lead@pathways.dev',
    password: 'demo123',
    name: 'WingC2 Lead',
    organizationalUnit: 'unit-9',
    role: 'Unit Leader',
  },
  {
    id: 'user-5',
    email: 'security.lead@pathways.dev',
    password: 'demo123',
    name: 'Security Lead',
    organizationalUnit: 'unit-12',
    role: 'Unit Leader',
  },
  {
    id: 'user-6',
    email: 'janus.lead@pathways.dev',
    password: 'demo123',
    name: 'Janus Team Lead',
    organizationalUnit: 'unit-10',
    role: 'Team Lead',
  },
];

// GET /api/users - Get all users
router.get('/', (req, res) => {
  // Don't send passwords
  const usersWithoutPasswords = users.map(({ password, ...user }) => user);
  res.json(usersWithoutPasswords);
});

// GET /api/users/:id - Get single user
router.get('/:id', (req, res) => {
  const user = users.find(u => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  const { password, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

// POST /api/users - Create new user
router.post('/', (req, res) => {
  const { name, email, password, organizationalUnit, role } = req.body;

  if (!name || !email || !password || !organizationalUnit || !role) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Check if email already exists
  if (users.find(u => u.email === email)) {
    return res.status(409).json({ message: 'Email already exists' });
  }

  const newUser = {
    id: `user-${Date.now()}`,
    name,
    email,
    password, // In production, hash this!
    organizationalUnit,
    role,
  };

  users.push(newUser);

  const { password: _, ...userWithoutPassword } = newUser;
  res.status(201).json(userWithoutPassword);
});

// PUT /api/users/:id - Update user
router.put('/:id', (req, res) => {
  const { name, email, password, organizationalUnit, role } = req.body;
  const userId = req.params.id;

  const userIndex = users.findIndex(u => u.id === userId);
  if (userIndex === -1) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Check if email is taken by another user
  if (email && email !== users[userIndex].email) {
    if (users.find(u => u.email === email && u.id !== userId)) {
      return res.status(409).json({ message: 'Email already exists' });
    }
  }

  // Update user
  users[userIndex] = {
    ...users[userIndex],
    name: name || users[userIndex].name,
    email: email || users[userIndex].email,
    password: password || users[userIndex].password,
    organizationalUnit: organizationalUnit || users[userIndex].organizationalUnit,
    role: role || users[userIndex].role,
  };

  const { password: _, ...userWithoutPassword } = users[userIndex];
  res.json(userWithoutPassword);
});

// DELETE /api/users/:id - Delete user
router.delete('/:id', (req, res) => {
  const userId = req.params.id;
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) {
    return res.status(404).json({ message: 'User not found' });
  }

  users.splice(userIndex, 1);
  res.json({ message: 'User deleted successfully' });
});

export default router;
