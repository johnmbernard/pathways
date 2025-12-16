/**
 * Pathways Forecasting Engine
 * 
 * Automatically calculates lead times and completion dates based on:
 * - Historical throughput (items/week) from completed work
 * - Current queue length by priority bucket
 * - Stack rank position within priority
 * 
 * NO ESTIMATION REQUIRED - Uses actual historical data
 */

import prisma from '../lib/prisma.js';

// ============================================
// THROUGHPUT CALCULATION
// ============================================

/**
 * Calculate team's throughput (items per week) from historical data
 * @param {string} teamId - Organizational unit ID
 * @param {number} weeksToAnalyze - Rolling window (default 6 weeks)
 * @returns {Promise<number>} Average items completed per week
 */
export async function calculateTeamThroughput(teamId, weeksToAnalyze = 6) {
  // Get throughput records for this team from last N weeks
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - (weeksToAnalyze * 7));
  
  const throughputRecords = await prisma.teamThroughput.findMany({
    where: {
      teamId,
      weekStartDate: { gte: cutoffDate },
    },
    orderBy: { weekStartDate: 'desc' },
  });
  
  if (throughputRecords.length === 0) {
    // Fallback: calculate from completed work items directly
    return await calculateThroughputFromWorkItems(teamId, weeksToAnalyze);
  }
  
  // Average items completed across the weeks
  const totalCompleted = throughputRecords.reduce((sum, record) => sum + record.itemsCompleted, 0);
  const avgThroughput = totalCompleted / throughputRecords.length;
  
  return Math.round(avgThroughput * 10) / 10; // Round to 1 decimal
}

/**
 * Fallback: Calculate throughput directly from completed work items
 */
async function calculateThroughputFromWorkItems(teamId, weeksToAnalyze) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - (weeksToAnalyze * 7));
  
  const completedItems = await prisma.workItem.count({
    where: {
      assignedOrgUnit: teamId,
      status: 'Done',
      completedAt: { gte: cutoffDate },
    },
  });
  
  const throughput = completedItems / weeksToAnalyze;
  return Math.round(throughput * 10) / 10;
}

/**
 * Get all teams' throughput in one query (for dashboard)
 */
export async function calculateAllTeamsThroughput(weeksToAnalyze = 6) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - (weeksToAnalyze * 7));
  
  const throughputData = await prisma.teamThroughput.groupBy({
    by: ['teamId'],
    where: {
      weekStartDate: { gte: cutoffDate },
    },
    _avg: {
      itemsCompleted: true,
    },
    _count: {
      teamId: true,
    },
  });
  
  return throughputData.map(data => ({
    teamId: data.teamId,
    throughput: Math.round(data._avg.itemsCompleted * 10) / 10,
    weeksTracked: data._count.teamId,
  }));
}

// ============================================
// QUEUE ANALYSIS
// ============================================

/**
 * Count items in each priority bucket for a team
 * @param {string} teamId - Organizational unit ID
 * @returns {Promise<Object>} Counts by priority
 */
export async function getQueueCounts(teamId) {
  const workItems = await prisma.workItem.findMany({
    where: {
      assignedOrgUnit: teamId,
      status: { in: ['Backlog', 'Ready', 'In Progress'] }, // Not done yet
    },
    select: {
      id: true,
      priority: true,
      stackRank: true,
    },
    orderBy: [
      { priority: 'asc' }, // P1, P2, P3
      { stackRank: 'asc' }, // Within priority, by rank
    ],
  });
  
  return {
    p1: workItems.filter(wi => wi.priority === 'P1').length,
    p2: workItems.filter(wi => wi.priority === 'P2').length,
    p3: workItems.filter(wi => wi.priority === 'P3').length,
    total: workItems.length,
    items: workItems, // Include full list for position calculation
  };
}

// ============================================
// LEAD TIME FORECASTING
// ============================================

/**
 * Calculate lead time (weeks) for a specific work item
 * @param {string} workItemId - Work item ID
 * @param {string} teamId - Organizational unit ID
 * @returns {Promise<Object>} Lead time forecast
 */
export async function forecastWorkItem(workItemId, teamId) {
  // Get the work item
  const workItem = await prisma.workItem.findUnique({
    where: { id: workItemId },
    select: {
      id: true,
      title: true,
      priority: true,
      stackRank: true,
      status: true,
    },
  });
  
  if (!workItem) {
    throw new Error('Work item not found');
  }
  
  if (workItem.status === 'Done') {
    return {
      workItemId,
      status: 'completed',
      leadTimeWeeks: 0,
      estimatedDate: null,
    };
  }
  
  // Get team throughput
  const throughput = await calculateTeamThroughput(teamId);
  
  if (throughput === 0) {
    return {
      workItemId,
      status: 'unknown',
      leadTimeWeeks: null,
      estimatedDate: null,
      message: 'No historical throughput data available',
    };
  }
  
  // Get queue counts
  const queue = await getQueueCounts(teamId);
  
  // Calculate how many items are ahead of this one
  let itemsAhead = 0;
  
  // All P1 items come first
  if (workItem.priority === 'P1') {
    // Count P1 items with lower stack rank (higher priority)
    itemsAhead = queue.items.filter(
      wi => wi.priority === 'P1' && wi.stackRank < workItem.stackRank
    ).length;
  } else if (workItem.priority === 'P2') {
    // All P1 items + P2 items with lower stack rank
    itemsAhead = queue.p1 + queue.items.filter(
      wi => wi.priority === 'P2' && wi.stackRank < workItem.stackRank
    ).length;
  } else if (workItem.priority === 'P3') {
    // All P1 + P2 + P3 items with lower stack rank
    itemsAhead = queue.p1 + queue.p2 + queue.items.filter(
      wi => wi.priority === 'P3' && wi.stackRank < workItem.stackRank
    ).length;
  }
  
  // Lead time = items ahead / throughput
  const leadTimeWeeks = itemsAhead / throughput;
  
  // Calculate estimated completion date
  const estimatedDate = new Date();
  estimatedDate.setDate(estimatedDate.getDate() + (leadTimeWeeks * 7));
  
  return {
    workItemId,
    title: workItem.title,
    priority: workItem.priority,
    stackRank: workItem.stackRank,
    queuePosition: itemsAhead + 1, // Position in queue (1-indexed)
    itemsAhead,
    throughput: Math.round(throughput * 10) / 10,
    leadTimeWeeks: Math.round(leadTimeWeeks * 10) / 10,
    leadTimeDays: Math.ceil(leadTimeWeeks * 7),
    estimatedDate: estimatedDate.toISOString().split('T')[0], // YYYY-MM-DD
  };
}

/**
 * Calculate team load (how many weeks of work in queue)
 * @param {string} teamId - Organizational unit ID
 * @returns {Promise<Object>} Team load analysis
 */
export async function calculateTeamLoad(teamId) {
  const throughput = await calculateTeamThroughput(teamId);
  const queue = await getQueueCounts(teamId);
  
  if (throughput === 0) {
    return {
      teamId,
      throughput: 0,
      queue,
      p1LoadWeeks: null,
      p2LoadWeeks: null,
      totalLoadWeeks: null,
      status: 'unknown',
    };
  }
  
  const p1LoadWeeks = queue.p1 / throughput;
  const p2LoadWeeks = (queue.p1 + queue.p2) / throughput;
  const totalLoadWeeks = queue.total / throughput;
  
  // Determine health status
  let status = 'healthy';
  if (totalLoadWeeks > 12) {
    status = 'overloaded'; // More than 3 months of work
  } else if (totalLoadWeeks > 8) {
    status = 'busy'; // 2-3 months of work
  }
  
  return {
    teamId,
    throughput: Math.round(throughput * 10) / 10,
    queue,
    p1LoadWeeks: Math.round(p1LoadWeeks * 10) / 10,
    p2LoadWeeks: Math.round(p2LoadWeeks * 10) / 10,
    totalLoadWeeks: Math.round(totalLoadWeeks * 10) / 10,
    p1LoadDays: Math.ceil(p1LoadWeeks * 7),
    p2LoadDays: Math.ceil(p2LoadWeeks * 7),
    totalLoadDays: Math.ceil(totalLoadWeeks * 7),
    status,
  };
}

/**
 * Forecast all items in a team's backlog
 * @param {string} teamId - Organizational unit ID
 * @returns {Promise<Array>} Forecasts for all items
 */
export async function forecastTeamBacklog(teamId) {
  const queue = await getQueueCounts(teamId);
  const throughput = await calculateTeamThroughput(teamId);
  
  if (throughput === 0 || queue.items.length === 0) {
    return [];
  }
  
  // Calculate forecast for each item
  const forecasts = [];
  let cumulativeItems = 0;
  
  for (const item of queue.items) {
    const leadTimeWeeks = cumulativeItems / throughput;
    const leadTimeDays = Math.ceil(leadTimeWeeks * 7);
    
    const estimatedDate = new Date();
    estimatedDate.setDate(estimatedDate.getDate() + leadTimeDays);
    
    forecasts.push({
      workItemId: item.id,
      priority: item.priority,
      stackRank: item.stackRank,
      queuePosition: cumulativeItems + 1,
      leadTimeWeeks: Math.round(leadTimeWeeks * 10) / 10,
      leadTimeDays,
      estimatedDate: estimatedDate.toISOString().split('T')[0],
    });
    
    cumulativeItems++;
  }
  
  return forecasts;
}

// ============================================
// PROJECT-LEVEL FORECASTING
// ============================================

/**
 * Calculate when a project's objectives will complete based on team assignments
 * @param {string} projectId - Project ID
 * @returns {Promise<Object>} Project timeline forecast
 */
export async function forecastProject(projectId) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      objectives: {
        include: {
          assignedUnits: {
            include: {
              unit: true,
            },
          },
        },
      },
    },
  });
  
  if (!project) {
    throw new Error('Project not found');
  }
  
  const objectiveForecasts = [];
  
  for (const objective of project.objectives) {
    // Count work items for this objective
    const workItemCount = await prisma.workItem.count({
      where: {
        refinementSession: {
          objectiveId: objective.id,
        },
        status: { not: 'Done' },
      },
    });
    
    // Get forecasts for each assigned team
    const teamForecasts = [];
    for (const assignment of objective.assignedUnits) {
      const teamLoad = await calculateTeamLoad(assignment.unitId);
      const itemsForTeam = Math.ceil(workItemCount / objective.assignedUnits.length); // Assume even split
      const leadTimeWeeks = teamLoad.throughput > 0 
        ? (teamLoad.queue.total + itemsForTeam) / teamLoad.throughput 
        : null;
      
      teamForecasts.push({
        teamId: assignment.unitId,
        teamName: assignment.unit.name,
        currentLoad: teamLoad.totalLoadWeeks,
        additionalItems: itemsForTeam,
        leadTimeWeeks,
      });
    }
    
    // Critical path = longest team lead time
    const maxLeadTime = Math.max(...teamForecasts.map(tf => tf.leadTimeWeeks || 0));
    const estimatedDate = new Date();
    estimatedDate.setDate(estimatedDate.getDate() + (maxLeadTime * 7));
    
    objectiveForecasts.push({
      objectiveId: objective.id,
      objectiveTitle: objective.title,
      targetDate: objective.targetDate,
      estimatedDate: estimatedDate.toISOString().split('T')[0],
      leadTimeWeeks: Math.round(maxLeadTime * 10) / 10,
      teamForecasts,
    });
  }
  
  // Project completes when last objective completes
  const latestObjective = objectiveForecasts.reduce((latest, obj) => 
    obj.leadTimeWeeks > (latest.leadTimeWeeks || 0) ? obj : latest
  , { leadTimeWeeks: 0 });
  
  return {
    projectId: project.id,
    projectTitle: project.title,
    targetDate: project.targetDate,
    estimatedDate: latestObjective.estimatedDate,
    leadTimeWeeks: latestObjective.leadTimeWeeks,
    objectiveForecasts,
  };
}

export default {
  calculateTeamThroughput,
  calculateAllTeamsThroughput,
  getQueueCounts,
  forecastWorkItem,
  calculateTeamLoad,
  forecastTeamBacklog,
  forecastProject,
};
