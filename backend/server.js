import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import usersRoutes from './routes/users.js';
import organizationalUnitsRoutes from './routes/organizationalUnits.js';
import projectsRoutes from './routes/projects.js';
import objectivesRoutes from './routes/objectives.js';
import refinementsRoutes from './routes/refinements.js';
import workItemsRoutes from './routes/workItems.js';
import forecastsRoutes from './routes/forecasts.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS Configuration - Environment-aware
const allowedOrigins = [
  'https://pathways.synapsesolves.com',
  /\.pages\.dev$/, // Allow any Cloudflare Pages preview URL
];

// Add localhost origins only in development
if (process.env.NODE_ENV === 'development') {
  allowedOrigins.push('http://localhost:5174', 'http://localhost:3000');
}

// Middleware
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/organizational-units', organizationalUnitsRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/objectives', objectivesRoutes);
app.use('/api/refinements', refinementsRoutes);
app.use('/api/work-items', workItemsRoutes);
app.use('/api/forecasts', forecastsRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://pathways-demo-backend.onrender.com'
    : `http://localhost:${PORT}`;
  console.log(`🚀 Server running on ${baseUrl}`);
  console.log(`📝 Health check: ${baseUrl}/api/health`);
});
