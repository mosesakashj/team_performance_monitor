import { runQuery } from '../db/driver.js';

/** Aggregate counts powering the dashboard's overview tiles. */
export async function getOverviewStats() {
  const rows = await runQuery(
    `
    MATCH (p:Person)
    WITH count(p) AS peopleCount, sum(CASE WHEN p.current_utilization_pct < 100 THEN 1 ELSE 0 END) AS availableCount
    MATCH (proj:Project)
    WITH peopleCount, availableCount, count(proj) AS projectCount,
         sum(CASE WHEN proj.status = 'active' THEN 1 ELSE 0 END) AS activeProjectCount
    MATCH (t:Team)
    WITH peopleCount, availableCount, projectCount, activeProjectCount, count(t) AS teamCount
    MATCH (s:Skill)
    RETURN peopleCount, availableCount, projectCount, activeProjectCount, teamCount, count(s) AS skillCount
    `,
    {}
  );
  return rows[0] ?? { peopleCount: 0, availableCount: 0, projectCount: 0, activeProjectCount: 0, teamCount: 0, skillCount: 0 };
}
