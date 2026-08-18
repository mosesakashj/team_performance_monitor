import { getOverviewStats } from './stats.queries.js';
import {
  getSkillDistribution,
  getProjectHealth,
  getGlobalSkillGaps,
  getActivityFeed,
  getEnrichedStats,
} from './dashboard.queries.js';
import { getBottleneckPeople } from './shared.queries.js';

/**
 * Batched dashboard data: combines multiple dashboard queries into a single request.
 * Reduces 8+ API calls to 1 on initial page load.
 * Returns data in the same format as individual endpoints for backward compatibility.
 */
export async function getDashboardBatch() {
  const [
    stats,
    enrichedStats,
    skillDistribution,
    projectHealth,
    bottlenecks,
    skillGaps,
    activityFeed,
  ] = await Promise.all([
    getOverviewStats(),
    getEnrichedStats(),
    getSkillDistribution(),
    getProjectHealth(),
    getBottleneckPeople({ limit: 5 }),
    getGlobalSkillGaps(),
    getActivityFeed(),
  ]);

  return {
    stats,
    enrichedStats,
    distribution: skillDistribution,
    health: projectHealth,
    bottlenecks,
    gaps: skillGaps,
    feed: activityFeed,
  };
}
