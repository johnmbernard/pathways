import express from 'express';
import {
  calculateTeamThroughput,
  calculateAllTeamsThroughput,
  getQueueCounts,
  forecastWorkItem,
  calculateTeamLoad,
  forecastTeamBacklog,
  forecastProject,
} from '../logic/forecastEngine.js';

const router = express.Router();

// GET team throughput (items per week)
router.get('/throughput/:teamId', async (req, res) => {
  try {
    const { teamId } = req.params;
    const weeks = parseInt(req.query.weeks) || 6;
    
    const throughput = await calculateTeamThroughput(teamId, weeks);
    
    res.json({
      teamId,
      throughput,
      weeksAnalyzed: weeks,
      unit: 'items per week',
    });
  } catch (error) {
    console.error('Error calculating throughput:', error);
    res.status(500).json({ error: 'Failed to calculate throughput' });
  }
});

// GET all teams' throughput
router.get('/throughput', async (req, res) => {
  try {
    const weeks = parseInt(req.query.weeks) || 6;
    const throughputData = await calculateAllTeamsThroughput(weeks);
    
    res.json({
      teams: throughputData,
      weeksAnalyzed: weeks,
    });
  } catch (error) {
    console.error('Error calculating all throughput:', error);
    res.status(500).json({ error: 'Failed to calculate throughput' });
  }
});

// GET team queue analysis
router.get('/queue/:teamId', async (req, res) => {
  try {
    const { teamId } = req.params;
    const queueData = await getQueueCounts(teamId);
    
    // Don't expose full items array in response, just counts
    const { items, ...counts } = queueData;
    
    res.json({
      teamId,
      ...counts,
    });
  } catch (error) {
    console.error('Error getting queue counts:', error);
    res.status(500).json({ error: 'Failed to get queue counts' });
  }
});

// GET team load analysis (throughput + queue = lead time)
router.get('/load/:teamId', async (req, res) => {
  try {
    const { teamId } = req.params;
    const loadData = await calculateTeamLoad(teamId);
    
    res.json(loadData);
  } catch (error) {
    console.error('Error calculating team load:', error);
    res.status(500).json({ error: 'Failed to calculate team load' });
  }
});

// GET forecast for specific work item
router.get('/work-item/:workItemId', async (req, res) => {
  try {
    const { workItemId } = req.params;
    const { teamId } = req.query;
    
    if (!teamId) {
      return res.status(400).json({ error: 'teamId query parameter required' });
    }
    
    const forecast = await forecastWorkItem(workItemId, teamId);
    
    res.json(forecast);
  } catch (error) {
    console.error('Error forecasting work item:', error);
    res.status(500).json({ error: 'Failed to forecast work item' });
  }
});

// GET forecast for team's entire backlog
router.get('/backlog/:teamId', async (req, res) => {
  try {
    const { teamId } = req.params;
    const forecasts = await forecastTeamBacklog(teamId);
    
    res.json({
      teamId,
      itemCount: forecasts.length,
      forecasts,
    });
  } catch (error) {
    console.error('Error forecasting backlog:', error);
    res.status(500).json({ error: 'Failed to forecast backlog' });
  }
});

// GET forecast for project timeline
router.get('/project/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const projectForecast = await forecastProject(projectId);
    
    res.json(projectForecast);
  } catch (error) {
    console.error('Error forecasting project:', error);
    res.status(500).json({ error: 'Failed to forecast project' });
  }
});

export default router;
