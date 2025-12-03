import express from 'express';
const router = express.Router();

// In-memory user storage (replace with database in production)
// Password is plain text for demo - use bcrypt in production
const users = [
  {
    id: 'user-1',
    email: 'kessel.lead@pathways.dev',
    password: 'demo123',
    name: 'Kessel Lead',
    organizationalUnit: 'org-1', // Root unit
    role: 'Unit Leader',
  },
  {
    id: 'user-2',
    email: 'opsc2.lead@pathways.dev',
    password: 'demo123',
    name: 'OpsC2 Lead',
    organizationalUnit: 'org-2', // Child of org-1
    role: 'Unit Leader',
  },
  {
    id: 'user-3',
    email: 'krados.lead@pathways.dev',
    password: 'demo123',
    name: 'KRADOS Team Lead',
    organizationalUnit: 'org-3', // Child of org-1
    role: 'Team Lead',
  },
  {
    id: 'user-4',
    email: 'wingc2.lead@pathways.dev',
    password: 'demo123',
    name: 'WingC2 Lead',
    organizationalUnit: 'org-4', // Child of org-1
    role: 'Unit Leader',
  },
  {
    id: 'user-5',
    email: 'security.lead@pathways.dev',
    password: 'demo123',
    name: 'Security Lead',
    organizationalUnit: 'org-5', // Another unit
    role: 'Unit Leader',
  },
  {
    id: 'user-6',
    email: 'janus.lead@pathways.dev',
    password: 'demo123',
    name: 'Janus Team Lead',
    organizationalUnit: 'org-6', // Another unit
    role: 'Team Lead',
  },
];

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  // Don't send password back
  const { password: _, ...userWithoutPassword } = user;

  res.json({
    user: userWithoutPassword,
    message: 'Login successful',
  });
});

// GET /api/auth/me (verify current session)
router.get('/me', (req, res) => {
  // In production, this would verify JWT token
  // For now, just return success
  res.json({ authenticated: true });
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.json({ message: 'Logout successful' });
});

export default router;
