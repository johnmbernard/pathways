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
async function calculateTeamThroughput(teamId, weeksToAnalyze = 6) {
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
async function calculateAllTeamsThroughput(weeksToAnalyze = 6) {
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
async function getQueueCounts(teamId) {
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
async function forecastWorkItem(workItemId, teamId) {
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
async function calculateTeamLoad(teamId) {
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
async function forecastTeamBacklog(teamId) {
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
// DEPENDENCY & CRITICAL PATH MANAGEMENT
// ============================================

/**
 * Fetch all dependencies for objectives in a project
 * @param {string} projectId - Project ID
 * @returns {Promise<Array>} Array of dependency relationships
 */
async function fetchObjectiveDependencies(projectId) {
  const objectives = await prisma.objective.findMany({
    where: { projectId },
    select: { id: true },
  });
  
  const objectiveIds = objectives.map(obj => obj.id);
  
  const dependencies = await prisma.objectiveDependency.findMany({
    where: {
      OR: [
        { predecessorId: { in: objectiveIds } },
        { successorId: { in: objectiveIds } },
      ],
    },
    include: {
      predecessor: { select: { id: true, title: true } },
      successor: { select: { id: true, title: true } },
    },
  });
  
  return dependencies;
}

/**
 * Topological sort of objectives based on dependencies
 * Uses Kahn's algorithm to determine valid execution order
 * @param {Array} objectives - Array of objective objects with id
 * @param {Array} dependencies - Array of dependency objects (FS only)
 * @returns {Array} Sorted objectives (dependencies first) or throws if cycle detected
 */
function topologicalSort(objectives, dependencies) {
  // Build adjacency list and in-degree count
  const adjList = new Map(); // successorId -> [predecessorIds]
  const inDegree = new Map(); // objectiveId -> count of dependencies
  
  // Initialize all objectives
  objectives.forEach(obj => {
    adjList.set(obj.id, []);
    inDegree.set(obj.id, 0);
  });
  
  // Build graph (only Finish-to-Start dependencies)
  dependencies.forEach(dep => {
    if (dep.type === 'FS') {
      adjList.get(dep.successorId).push(dep.predecessorId);
      inDegree.set(dep.successorId, inDegree.get(dep.successorId) + 1);
    }
  });
  
  // Find all nodes with no dependencies
  const queue = objectives.filter(obj => inDegree.get(obj.id) === 0);
  const sorted = [];
  
  while (queue.length > 0) {
    const current = queue.shift();
    sorted.push(current);
    
    // For each objective that depends on current
    dependencies.forEach(dep => {
      if (dep.type === 'FS' && dep.predecessorId === current.id) {
        const successor = dep.successorId;
        inDegree.set(successor, inDegree.get(successor) - 1);
        
        if (inDegree.get(successor) === 0) {
          const successorObj = objectives.find(obj => obj.id === successor);
          if (successorObj) queue.push(successorObj);
        }
      }
    });
  }
  
  // If we haven't processed all objectives, there's a cycle
  if (sorted.length !== objectives.length) {
    throw new Error('Circular dependency detected in objectives');
  }
  
  return sorted;
}

/**
 * Calculate earliest start date for an objective based on dependencies
 * @param {string} objectiveId - Objective ID
 * @param {Map} predecessorResults - Map of objectiveId -> forecast result
 * @param {Array} dependencies - All dependencies
 * @param {Date} projectStartDate - When project started
 * @returns {Date} Earliest date this objective can start
 */
function calculateEarliestStart(objectiveId, predecessorResults, dependencies, projectStartDate) {
  const projectStart = new Date(projectStartDate);
  
  // Find all FS dependencies where this objective is the successor
  const blockingDependencies = dependencies.filter(
    dep => dep.type === 'FS' && dep.successorId === objectiveId
  );
  
  if (blockingDependencies.length === 0) {
    // No dependencies, can start from project start date
    return projectStart;
  }
  
  // Find the latest finish date among all predecessors
  let latestPredecessorFinish = projectStart;
  
  blockingDependencies.forEach(dep => {
    const predecessorResult = predecessorResults.get(dep.predecessorId);
    if (predecessorResult && predecessorResult.consolidatedFinish) {
      const predFinish = new Date(predecessorResult.consolidatedFinish);
      if (predFinish > latestPredecessorFinish) {
        latestPredecessorFinish = predFinish;
      }
    }
  });
  
  return latestPredecessorFinish;
}

/**
 * Forecast when a team can actually start and finish their portion of an objective
 * considering their current queue and priorities
 * @param {string} teamId - Team ID
 * @param {number} itemCount - Number of work items for this objective
 * @param {Date} earliestStart - Can't start before this date
 * @param {Array} workItems - Work items for this objective
 * @returns {Promise<Object>} Team-specific forecast
 */
async function forecastTeamObjective(teamId, itemCount, earliestStart, workItems) {
  const teamLoad = await calculateTeamLoad(teamId);
  const teamName = ''; // Will be filled by caller
  
  if (teamLoad.throughput === 0) {
    return {
      teamId,
      teamName,
      currentLoad: 0,
      workItemCount: itemCount,
      leadTimeWeeks: null,
      teamStart: earliestStart.toISOString().split('T')[0],
      teamFinish: earliestStart.toISOString().split('T')[0],
      status: 'no_throughput_data',
    };
  }
  
  // Calculate when team can start based on queue
  // Queue time starts AFTER dependencies are satisfied
  const queueDays = Math.ceil(teamLoad.totalLoadWeeks * 7);
  const queueBasedStart = new Date(earliestStart);
  queueBasedStart.setDate(queueBasedStart.getDate() + queueDays);
  
  console.log(`    Team ${teamId}: currentLoad=${teamLoad.totalLoadWeeks.toFixed(1)}w, queueDays=${queueDays}, queueBasedStart=${queueBasedStart.toISOString().split('T')[0]}`);
  
  // Actual start = when queue clears after dependencies are met
  const teamStart = queueBasedStart;
  
  // Duration for this team
  const durationWeeks = itemCount / teamLoad.throughput;
  const durationDays = Math.ceil(durationWeeks * 7);
  
  // Finish = start + duration
  const teamFinish = new Date(teamStart);
  teamFinish.setDate(teamFinish.getDate() + durationDays);
  
  return {
    teamId,
    teamName,
    currentLoad: teamLoad.totalLoadWeeks,
    workItemCount: itemCount,
    leadTimeWeeks: Math.round(durationWeeks * 10) / 10,
    teamStart: teamStart.toISOString().split('T')[0],
    teamFinish: teamFinish.toISOString().split('T')[0],
    queueDays,
  };
}

/**
 * Identify which objectives are on the critical path
 * An objective is on the critical path if any delay would push out the project end date
 * @param {Array} objectiveForecasts - All objective forecast results
 * @param {Date} projectFinish - Overall project finish date
 * @param {Array} dependencies - All dependencies
 * @returns {Set} Set of objective IDs on critical path
 */
function identifyCriticalPath(objectiveForecasts, projectFinish, dependencies) {
  const criticalPath = new Set();
  
  // Find objectives that finish at or near project completion
  const projectFinishTime = new Date(projectFinish).getTime();
  
  // Start with objectives that determine project end (within 1 day tolerance)
  const criticalLeaves = objectiveForecasts.filter(obj => {
    const objFinish = new Date(obj.consolidatedFinish).getTime();
    return Math.abs(objFinish - projectFinishTime) < (24 * 60 * 60 * 1000); // Within 1 day
  });
  
  // Add these to critical path
  criticalLeaves.forEach(obj => criticalPath.add(obj.objectiveId));
  
  // Walk backwards through dependencies to find all objectives on critical chain
  const queue = [...criticalLeaves];
  const visited = new Set();
  
  while (queue.length > 0) {
    const current = queue.shift();
    if (visited.has(current.objectiveId)) continue;
    visited.add(current.objectiveId);
    
    // Find all predecessors of this objective
    const predecessors = dependencies
      .filter(dep => dep.type === 'FS' && dep.successorId === current.objectiveId)
      .map(dep => dep.predecessorId);
    
    predecessors.forEach(predId => {
      const predForecast = objectiveForecasts.find(obj => obj.objectiveId === predId);
      if (predForecast) {
        // Check if predecessor's finish directly feeds into current's start
        const predFinish = new Date(predForecast.consolidatedFinish).getTime();
        const currentStart = new Date(current.consolidatedStart).getTime();
        
        // If there's no slack (finish -> start), it's on critical path
        const slack = (currentStart - predFinish) / (1000 * 60 * 60 * 24); // days
        if (slack <= 1) { // Within 1 day tolerance
          criticalPath.add(predId);
          queue.push(predForecast);
        }
      }
    });
  }
  
  return criticalPath;
}

// ============================================
// PROJECT-LEVEL FORECASTING
// ============================================

/**
 * Calculate when a project's objectives will complete based on team assignments
 * @param {string} projectId - Project ID
 * @returns {Promise<Object>} Project timeline forecast
 */
async function forecastProject(projectId) {
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
  
  // If no objectives, return basic project info
  if (!project.objectives || project.objectives.length === 0) {
    return {
      projectId: project.id,
      projectTitle: project.title,
      targetDate: project.targetDate,
      estimatedDate: null,
      leadTimeWeeks: 0,
      objectiveForecasts: [],
    };
  }
  
  // Step 1: Fetch dependencies and sort objectives topologically
  const dependencies = await fetchObjectiveDependencies(projectId);
  let sortedObjectives;
  
  try {
    sortedObjectives = topologicalSort(project.objectives, dependencies);
  } catch (error) {
    // If circular dependency, fall back to original order and flag it
    console.error('Circular dependency detected:', error);
    sortedObjectives = project.objectives;
  }
  
  // Step 2: Process objectives in dependency order
  const objectiveForecasts = [];
  const predecessorResults = new Map(); // objectiveId -> forecast result
  
  for (const objective of sortedObjectives) {
    // Skip objectives with no team assignments
    if (!objective.assignedUnits || objective.assignedUnits.length === 0) {
      continue;
    }
    
    // Calculate earliest start based on dependencies
    const earliestStart = calculateEarliestStart(
      objective.id,
      predecessorResults,
      dependencies,
      project.startDate || project.createdAt
    );
    
    // Debug logging
    console.log(`\n[Forecast] Objective: "${objective.title}" (ID: ${objective.id})`);
    console.log(`  Project start: ${(project.startDate || project.createdAt).split('T')[0]}`);
    console.log(`  Earliest start: ${earliestStart.toISOString().split('T')[0]}`);
    
    const objDeps = dependencies.filter(d => d.successorId === objective.id);
    if (objDeps.length > 0) {
      console.log(`  Dependencies: ${objDeps.length} predecessor(s)`);
    }
    
    // Get work items for this objective with alerts
    const workItems = await prisma.workItem.findMany({
      where: {
        refinementSession: {
          objectiveId: objective.id,
        },
        status: { not: 'Done' },
      },
      include: {
        creator: true,
      },
    });
    
    // Identify alerts
    const alerts = [];
    const now = new Date();
    
    // Check for blocked items (In Progress for > 7 days)
    const blockedItems = workItems.filter(item => {
      if (item.status === 'In Progress' && item.updatedAt) {
        const daysSinceUpdate = Math.floor((now - new Date(item.updatedAt)) / (1000 * 60 * 60 * 24));
        return daysSinceUpdate > 7;
      }
      return false;
    });
    
    blockedItems.forEach(item => {
      const daysSinceUpdate = Math.floor((now - new Date(item.updatedAt)) / (1000 * 60 * 60 * 24));
      alerts.push({
        type: 'blocked',
        severity: daysSinceUpdate > 14 ? 'critical' : 'warning',
        workItemId: item.id,
        workItemTitle: item.title,
        message: `${item.title} has been in progress for ${daysSinceUpdate} days`,
        daysStale: daysSinceUpdate,
      });
    });
    
    // Check for high-priority items stuck in backlog (P1 items in Backlog status)
    const stuckP1Items = workItems.filter(item => 
      item.priority === 'P1' && item.status === 'Backlog'
    );
    
    stuckP1Items.forEach(item => {
      alerts.push({
        type: 'stuck',
        severity: 'warning',
        workItemId: item.id,
        workItemTitle: item.title,
        message: `High priority item "${item.title}" is stuck in backlog`,
      });
    });
    
    // Get forecasts for each assigned team (Option B: teams start when they can)
    const teamForecasts = [];
    for (const assignment of objective.assignedUnits) {
      const itemsForTeam = Math.ceil(workItems.length / objective.assignedUnits.length); // Assume even split
      const teamForecast = await forecastTeamObjective(
        assignment.unitId,
        itemsForTeam,
        earliestStart,
        workItems
      );
      teamForecast.teamName = assignment.unit.name; // Add team name
      teamForecasts.push(teamForecast);
    }
    
    // Consolidate: start = earliest team start, finish = latest team finish
    const teamStarts = teamForecasts.map(tf => new Date(tf.teamStart));
    const teamFinishes = teamForecasts.map(tf => new Date(tf.teamFinish));
    
    const consolidatedStart = new Date(Math.min(...teamStarts));
    const consolidatedFinish = new Date(Math.max(...teamFinishes));
    
    console.log(`  → Consolidated: ${consolidatedStart.toISOString().split('T')[0]} to ${consolidatedFinish.toISOString().split('T')[0]}`);
    
    const durationDays = Math.ceil((consolidatedFinish - consolidatedStart) / (1000 * 60 * 60 * 24));
    const maxLeadTimeWeeks = Math.max(...teamForecasts.map(tf => tf.leadTimeWeeks || 0));
    
    
    // Check if objective is behind schedule
    if (objective.targetDate) {
      const targetDate = new Date(objective.targetDate);
      const variance = Math.floor((consolidatedFinish - targetDate) / (1000 * 60 * 60 * 24));
      if (variance > 0) {
        alerts.push({
          type: 'behind_schedule',
          severity: variance > 7 ? 'critical' : 'warning',
          message: `Objective is ${variance} days behind target date`,
          daysLate: variance,
        });
      }
    }
    
    const forecastResult = {
      objectiveId: objective.id,
      objectiveTitle: objective.title,
      targetDate: objective.targetDate,
      earliestStart: earliestStart.toISOString().split('T')[0],
      consolidatedStart: consolidatedStart.toISOString().split('T')[0],
      consolidatedFinish: consolidatedFinish.toISOString().split('T')[0],
      estimatedDate: consolidatedFinish.toISOString().split('T')[0],
      leadTimeWeeks: Math.round(maxLeadTimeWeeks * 10) / 10,
      durationDays,
      teamForecasts,
      alerts: alerts.sort((a, b) => {
        // Sort by severity (critical first) then by type
        const severityOrder = { critical: 0, warning: 1 };
        return severityOrder[a.severity] - severityOrder[b.severity];
      }),
      workItemCount: workItems.length,
      isOnCriticalPath: false, // Will be determined in Step 4
    };
    
    objectiveForecasts.push(forecastResult);
    predecessorResults.set(objective.id, forecastResult);
  }
  
  // Step 3: Identify critical path
  // Project completes when last objective completes
  const latestFinish = objectiveForecasts.length > 0
    ? objectiveForecasts.reduce((latest, obj) => {
        const objFinish = new Date(obj.consolidatedFinish);
        const latestFinish = new Date(latest.consolidatedFinish);
        return objFinish > latestFinish ? obj : latest;
      }, objectiveForecasts[0])
    : null;
  
  const projectFinish = latestFinish ? new Date(latestFinish.consolidatedFinish) : new Date();
  const criticalPathIds = identifyCriticalPath(objectiveForecasts, projectFinish, dependencies);
  
  // Mark objectives on critical path
  objectiveForecasts.forEach(obj => {
    obj.isOnCriticalPath = criticalPathIds.has(obj.objectiveId);
  });
  
  // Generate project-level alerts
  const projectAlerts = [];
  
  if (project.targetDate && latestFinish) {
    const projectTargetDate = new Date(project.targetDate);
    const projectEstimatedDate = new Date(latestFinish.consolidatedFinish);
    const projectVariance = Math.floor((projectEstimatedDate - projectTargetDate) / (1000 * 60 * 60 * 24));
    
    if (projectVariance > 0) {
      // Project is behind schedule
      const criticalObjectives = objectiveForecasts.filter(obj => obj.isOnCriticalPath);
      const behindObjectives = criticalObjectives.filter(obj => 
        obj.alerts.some(alert => alert.type === 'behind_schedule')
      );
      
      projectAlerts.push({
        type: 'project_behind_schedule',
        severity: projectVariance > 14 ? 'critical' : 'warning',
        message: `Project is ${projectVariance} days behind target date`,
        daysLate: projectVariance,
        criticalPathCount: criticalObjectives.length,
        behindObjectiveIds: behindObjectives.map(obj => obj.objectiveId),
      });
      
      // Add specific alert about critical path objectives
      if (behindObjectives.length > 0) {
        projectAlerts.push({
          type: 'critical_path_delay',
          severity: 'warning',
          message: `${behindObjectives.length} objective(s) on critical path are behind schedule`,
          affectedObjectiveIds: behindObjectives.map(obj => obj.objectiveId),
        });
      }
    }
  }
  
  return {
    projectId: project.id,
    projectTitle: project.title,
    targetDate: project.targetDate,
    estimatedDate: latestFinish?.estimatedDate || null,
    leadTimeWeeks: latestFinish?.leadTimeWeeks || 0,
    objectiveForecasts,
    criticalPathObjectiveIds: Array.from(criticalPathIds),
    alerts: projectAlerts,
  };
}

export {
  calculateTeamThroughput,
  calculateAllTeamsThroughput,
  getQueueCounts,
  forecastWorkItem,
  calculateTeamLoad,
  forecastTeamBacklog,
  forecastProject,
  // Critical path utilities (exported for testing)
  fetchObjectiveDependencies,
  topologicalSort,
  calculateEarliestStart,
  forecastTeamObjective,
  identifyCriticalPath,
};
