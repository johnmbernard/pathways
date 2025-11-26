// -----------------------------------------------------------
// Pathways Capacity Engine
// Lightweight throughput + priority-bucket forecaster
// -----------------------------------------------------------

export const PRIORITY = {
  P1: "P1", // Now
  P2: "P2", // Next
  P3: "P3", // Later
};

/**
 * Calculate team throughput (issues/week)
 * @param {Array<number>} completedPerWeek - e.g. [12, 10, 8, 14, 9, 11]
 * @returns {number}
 */
export function calculateThroughput(completedPerWeek) {
  if (!completedPerWeek.length) return 0;
  const sum = completedPerWeek.reduce((a, b) => a + b, 0);
  return Math.round(sum / completedPerWeek.length);
}

/**
 * Count issues by priority bucket.
 * @param {Array<Object>} issues - array of { id, priority }
 */
export function bucketCounts(issues) {
  return {
    p1: issues.filter((i) => i.priority === PRIORITY.P1).length,
    p2: issues.filter((i) => i.priority === PRIORITY.P2).length,
    p3: issues.filter((i) => i.priority === PRIORITY.P3).length,
  };
}

/**
 * Forecast lead time for a given item based on bucket volume.
 * @param {string} itemId
 * @param {Array<Object>} issues - full backlog
 * @param {number} throughput - issues/week
 * @returns {object} { weeks, window }
 */
export function forecastForItem(itemId, issues, throughput) {
  if (!throughput) return { weeks: null, window: "unknown" };

  const item = issues.find((i) => i.id === itemId);
  if (!item) return { weeks: null, window: "unknown" };

  const counts = bucketCounts(issues);

  // Determine how many issues are "ahead" of this one
  let ahead = 0;

  if (item.priority === PRIORITY.P1) {
    ahead = issues.filter(
      (i) => i.priority === PRIORITY.P1 && i.id !== itemId
    ).length;
  }

  if (item.priority === PRIORITY.P2) {
    ahead = counts.p1 + issues.filter(
      (i) => i.priority === PRIORITY.P2 && i.id !== itemId
    ).length;
  }

  if (item.priority === PRIORITY.P3) {
    ahead = counts.p1 + counts.p2 + issues.filter(
      (i) => i.priority === PRIORITY.P3 && i.id !== itemId
    ).length;
  }

  // compute forecast
  const weeks = ahead / throughput;

  return {
    weeks: Number(weeks.toFixed(1)),
    window: `~${weeks.toFixed(1)} weeks`,
  };
}

/**
 * Global forecast: how loaded is the team?
 * @param {Array<Object>} issues
 * @param {number} throughput
 */
export function teamLoad(issues, throughput) {
  const counts = bucketCounts(issues);

  return {
    throughput,
    p1LoadWeeks: counts.p1 / throughput,
    p2LoadWeeks: (counts.p1 + counts.p2) / throughput,
    totalLoadWeeks: (counts.p1 + counts.p2 + counts.p3) / throughput,
    buckets: counts,
  };
}
