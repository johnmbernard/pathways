// Example route module
// Import in server.js with: import exampleRoutes from './routes/example.js';
// Mount with: app.use('/api/example', exampleRoutes);

import express from 'express';
import { exampleLogic, validateInput } from '../logic/capacityEngine.js';

const router = express.Router();

router.get('/', (req, res) => {
  try {
    const result = exampleLogic({ message: 'Hello from example route' });
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/', (req, res) => {
  try {
    validateInput(req.body);
    const result = exampleLogic(req.body);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
