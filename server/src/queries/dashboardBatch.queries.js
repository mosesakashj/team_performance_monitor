import { getOverviewStats } from './stats.queries.js';
import {
  getSkillDistribution,
  getProjectHealth,
  getGlobalSkillGaps,
  getActivityFeed,
  getEnrichedStats,
} from './dashboard.queries.js';
import { getBottleneckPeople } from './shared.queries.js';
import { runQuery } from '../db/driver.js';

async function getTeamUtilization() {
  const rows = await runQuery(
    `
    MATCH (t:Team)
    OPTIONAL MATCH (p:Person)-[m:MEMBER_OF]->(t)
    WHERE m.end_date IS NULL
    WITH t, count(p) AS memberCount
    OPTIONAL MATCH (t)-[:DELIVERS]->(proj:Project)
    WITH t, memberCount, count(proj) AS projectCount
    RETURN t.id AS id, t.name AS name, memberCount, projectCount
    ORDER BY memberCount DESC
    `
  );
  return rows;
}

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
    teamUtilization,
  ] = await Promise.all([
    getOverviewStats(),
    getEnrichedStats(),
    getSkillDistribution(),
    getProjectHealth(),
    getBottleneckPeople({ limit: 5 }),
    getGlobalSkillGaps(),
    getActivityFeed(),
    getTeamUtilization(),
  ]);

  return {
    stats,
    enrichedStats,
    distribution: skillDistribution,
    health: projectHealth,
    bottlenecks,
    gaps: skillGaps,
    feed: activityFeed,
    teamUtilization,
  };
}
