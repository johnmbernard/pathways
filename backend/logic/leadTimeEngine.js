/**
 * Lead Time Calculation Engine
 * 
 * Calculates estimated completion dates based on:
 * - Team throughput (historical completion rate)
 * - Current queue length
 * - Dependencies between objectives
 * - Risk factors
 */

/**
 * Calculate team throughput (items completed per day)
 * @param {Array} completedItems - Array of work items with completedAt dates
 * @param {number} daysToAnalyze - Rolling window (default 30 days)
 * @returns {number} Items per day
 */
function calculateThroughput(completedItems, daysToAnalyze = 30) {
  if (!completedItems || completedItems.length === 0) {
    return 0.25; // Default assumption: 1 item every 4 days
  }
  
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToAnalyze);
  
  const recentItems = completedItems.filter(item => {
    const completedDate = new Date(item.completedAt);
    return completedDate >= cutoffDate;
  });
  
  if (recentItems.length === 0) {
    return 0.25; // Default
  }
  
  // Items completed / days analyzed
  return recentItems.length / daysToAnalyze;
}

/**
 * Calculate lead time for a team
 * @param {string} teamId - Team identifier
 * @param {number} workItemCount - Number of new items to add
 * @param {Array} currentQueue - Current P1/P2 items in queue
 * @param {Array} completedItems - Historical completed items
 * @param {Array} dependencies - Array of dependency objects
 * @returns {Object} Lead time analysis
 */
function calculateLeadTime(teamId, workItemCount, currentQueue = [], completedItems = [], dependencies = []) {
  const throughput = calculateThroughput(completedItems, 30);
  const queueLength = currentQueue.length;
  
  // Base lead time: (current queue + new items) / throughput
  let baseLeadTime = (queueLength + workItemCount) / throughput;
  
  // Add dependency buffer
  let dependencyBuffer = 0;
  if (dependencies.length > 0) {
    dependencyBuffer = calculateDependencyBuffer(dependencies);
  }
  
  const totalLeadTime = baseLeadTime + dependencyBuffer;
  
  return {
    teamId,
    leadTimeDays: Math.ceil(totalLeadTime),
    baseLeadTimeDays: Math.ceil(baseLeadTime),
    queueLength,
    newItemCount: workItemCount,
    throughput: Math.round(throughput * 100) / 100, // Round to 2 decimals
    dependencyBufferDays: Math.ceil(dependencyBuffer),
    calculatedDate: addDays(new Date(), Math.ceil(totalLeadTime))
  };
}

/**
 * Calculate buffer time needed for dependencies
 * @param {Array} dependencies - Array of {teamId, workItemCount, targetDate}
 * @returns {number} Days to add for dependency buffer
 */
function calculateDependencyBuffer(dependencies) {
  // Dependencies run in parallel up to the longest one
  // This represents the critical path
  let maxDependencyTime = 0;
  
  for (const dep of dependencies) {
    const depLeadTime = dep.calculatedLeadTime || 0;
    maxDependencyTime = Math.max(maxDependencyTime, depLeadTime);
  }
  
  return maxDependencyTime;
}

/**
 * Compare calculated date to target date
 * @param {Date} calculatedDate - Estimated completion date
 * @param {Date} targetDate - Leadership's target date
 * @returns {Object} Variance analysis
 */
function compareToTarget(calculatedDate, targetDate) {
  const calcTime = new Date(calculatedDate).getTime();
  const targetTime = new Date(targetDate).getTime();
  
  const varianceDays = Math.ceil((calcTime - targetTime) / (1000 * 60 * 60 * 24));
  
  let status = 'on_track';
  if (varianceDays > 5) {
    status = 'critical';
  } else if (varianceDays > 0) {
    status = 'at_risk';
  }
  
  return {
    varianceDays,
    varianceText: varianceDays > 0 ? `+${varianceDays} days` : `${varianceDays} days`,
    status,
    isLate: varianceDays > 0
  };
}

/**
 * Calculate what's needed to meet target
 * @param {number} currentThroughput - Items per day
 * @param {number} queueLength - Current queue size
 * @param {number} newItems - Items to add
 * @param {number} targetDays - Days until target
 * @returns {Object} Recommendations
 */
function calculateTargetRequirements(currentThroughput, queueLength, newItems, targetDays) {
  const totalItems = queueLength + newItems;
  const requiredThroughput = totalItems / targetDays;
  const throughputIncrease = requiredThroughput - currentThroughput;
  const itemsToRemove = Math.ceil(totalItems - (currentThroughput * targetDays));
  
  return {
    requiredThroughput: Math.round(requiredThroughput * 100) / 100,
    throughputIncrease: Math.round(throughputIncrease * 100) / 100,
    itemsToRemove: Math.max(0, itemsToRemove),
    recommendations: [
      throughputIncrease > 0 ? `Increase throughput to ${requiredThroughput.toFixed(2)} items/day` : null,
      itemsToRemove > 0 ? `Reduce queue by ${itemsToRemove} items` : null,
      'Negotiate target date with leadership'
    ].filter(Boolean)
  };
}

/**
 * Aggregate lead times across multiple teams
 * @param {Array} teamLeadTimes - Array of lead time objects from calculateLeadTime
 * @returns {Object} Aggregated analysis
 */
function aggregateLeadTimes(teamLeadTimes) {
  if (!teamLeadTimes || teamLeadTimes.length === 0) {
    return { totalLeadTimeDays: 0, criticalPath: [] };
  }
  
  // For parallel work, use the longest lead time (critical path)
  const maxLeadTime = Math.max(...teamLeadTimes.map(t => t.leadTimeDays));
  const criticalPathTeams = teamLeadTimes.filter(t => t.leadTimeDays === maxLeadTime);
  
  return {
    totalLeadTimeDays: maxLeadTime,
    averageLeadTimeDays: Math.ceil(
      teamLeadTimes.reduce((sum, t) => sum + t.leadTimeDays, 0) / teamLeadTimes.length
    ),
    criticalPath: criticalPathTeams.map(t => t.teamId),
    teamBreakdown: teamLeadTimes
  };
}

/**
 * Utility: Add days to a date
 */
function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Calculate project timeline by rolling up all objectives
 * @param {Array} objectives - All objectives in project with team assignments
 * @param {Object} teamData - Map of teamId -> {queue, completedItems}
 * @returns {Object} Project timeline analysis
 */
function calculateProjectTimeline(objectives, teamData) {
  const objectiveAnalysis = [];
  
  for (const objective of objectives) {
    const teamLeadTimes = [];
    
    for (const teamId of objective.assignedTeams || []) {
      const data = teamData[teamId] || { queue: [], completedItems: [] };
      const leadTime = calculateLeadTime(
        teamId,
        objective.workItemCount || 0,
        data.queue,
        data.completedItems,
        objective.dependencies || []
      );
      teamLeadTimes.push(leadTime);
    }
    
    const aggregated = aggregateLeadTimes(teamLeadTimes);
    const comparison = compareToTarget(
      addDays(new Date(), aggregated.totalLeadTimeDays),
      objective.targetDate
    );
    
    objectiveAnalysis.push({
      objectiveId: objective.id,
      objectiveTitle: objective.title,
      targetDate: objective.targetDate,
      calculatedLeadTime: aggregated.totalLeadTimeDays,
      calculatedDate: addDays(new Date(), aggregated.totalLeadTimeDays),
      variance: comparison,
      teamBreakdown: aggregated.teamBreakdown,
      criticalPath: aggregated.criticalPath
    });
  }
  
  // Project completes when all objectives complete
  const latestObjective = objectiveAnalysis.reduce((latest, obj) => {
    return obj.calculatedLeadTime > latest.calculatedLeadTime ? obj : latest;
  }, objectiveAnalysis[0] || { calculatedLeadTime: 0 });
  
  return {
    projectLeadTimeDays: latestObjective?.calculatedLeadTime || 0,
    projectCalculatedDate: latestObjective?.calculatedDate || new Date(),
    objectiveAnalysis,
    criticalPathObjectives: [latestObjective?.objectiveId].filter(Boolean)
  };
}

module.exports = {
  calculateThroughput,
  calculateLeadTime,
  calculateDependencyBuffer,
  compareToTarget,
  calculateTargetRequirements,
  aggregateLeadTimes,
  calculateProjectTimeline,
  addDays
};
