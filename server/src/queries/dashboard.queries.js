import { runQuery } from '../db/driver.js';

/**
 * Utilization heatmap: average utilization per team, broken down by seniority.
 */
export async function getUtilizationHeatmap() {
  return runQuery(
    `
    MATCH (p:Person)-[:MEMBER_OF]->(t:Team)
    WITH t, p.seniority AS seniority, p.current_utilization_pct AS utilization
    WITH t, seniority, avg(utilization) AS avgUtil, count(*) AS headcount
    RETURN t { .id, .name } AS team, seniority, avgUtil, headcount
    ORDER BY t.name, seniority
    `
  );
}

/**
 * Skill distribution: count of people per skill category.
 */
export async function getSkillDistribution() {
  return runQuery(
    `
    MATCH (p:Person)-[hs:HAS_SKILL]->(s:Skill)
    WITH s.category AS category, count(DISTINCT p) AS peopleCount, avg(hs.proficiency) AS avgProficiency, count(DISTINCT s) AS skillCount
    RETURN category, peopleCount, avgProficiency, skillCount
    ORDER BY peopleCount DESC
    `
  );
}

/**
 * Project health: status breakdown + avg staffing + avg priority.
 */
export async function getProjectHealth() {
  return runQuery(
    `
    MATCH (proj:Project)
    OPTIONAL MATCH (person:Person)-[:WORKED_ON]->(proj)
    WITH proj, count(DISTINCT person) AS staffCount
    RETURN proj.status AS status,
           count(proj) AS projectCount,
           avg(staffCount) AS avgStaff,
           avg(proj.priority) AS avgPriority,
           sum(CASE WHEN proj.status = 'active' THEN 1 ELSE 0 END) AS activeCount,
           sum(CASE WHEN proj.status = 'proposed' THEN 1 ELSE 0 END) AS proposedCount,
           sum(CASE WHEN proj.status = 'completed' THEN 1 ELSE 0 END) AS completedCount,
           sum(CASE WHEN proj.status = 'on_hold' THEN 1 ELSE 0 END) AS onHoldCount
    `
  );
}

/**
 * Top bottleneck people with detailed breakdown.
 */
export async function getTopBottlenecks({ limit = 5 } = {}) {
  return runQuery(
    `
    MATCH (p:Person)
    OPTIONAL MATCH (p)-[:WORKED_ON]->(proj:Project)
    WITH p, count(DISTINCT proj) AS projectCount
    OPTIONAL MATCH (p)<-[e:ENDORSED]-(endorser:Person)
    WITH p, projectCount, count(DISTINCT endorser) AS endorsementCount
    OPTIONAL MATCH (p)-[:HAS_SKILL]->(s:Skill)
    WITH p, projectCount, endorsementCount, count(DISTINCT s) AS skillCount,
         (projectCount * 2 + endorsementCount * 0.5) AS score
    RETURN p { .id, .name, .title, .current_utilization_pct } AS person,
           projectCount, endorsementCount, skillCount, score
    ORDER BY score DESC
    LIMIT toInteger($limit)
    `,
    { limit }
  );
}

/**
 * Skill gaps across all projects: skills that are needed but underrepresented.
 */
export async function getGlobalSkillGaps() {
  return runQuery(
    `
    MATCH (proj:Project)-[:REQUIRES_SKILL]->(s:Skill)
    WITH s, count(DISTINCT proj) AS demandCount, collect(DISTINCT proj.name)[0..3] AS neededBy
    OPTIONAL MATCH (p:Person)-[:HAS_SKILL]->(s)
    WITH s, demandCount, neededBy, count(DISTINCT p) AS supplyCount
    WHERE supplyCount < demandCount
    RETURN s { .id, .name, .category } AS skill,
           demandCount, supplyCount,
           CASE WHEN supplyCount > 0 THEN toFloat(demandCount) / supplyCount ELSE 10.0 END AS ratio,
           neededBy
    ORDER BY ratio DESC
    LIMIT 10
    `
  );
}

/**
 * Activity feed: recent endorsements and project changes.
 */
export async function getActivityFeed() {
  return runQuery(
    `
    MATCH (endorser:Person)-[e:ENDORSED]->(p:Person)
    RETURN 'endorsement' AS type, endorser.name AS actor, p.name AS target,
           e.date AS date, e.note AS detail
    ORDER BY e.date DESC LIMIT 10
    `
  );
}

/**
 * Overview stats enriched with additional metrics.
 */
export async function getEnrichedStats() {
  const rows = await runQuery(
    `
    MATCH (p:Person)
    WITH count(p) AS peopleCount,
         sum(CASE WHEN p.current_utilization_pct < 100 THEN 1 ELSE 0 END) AS availableCount,
         avg(p.current_utilization_pct) AS avgUtilization
    MATCH (proj:Project)
    WITH peopleCount, availableCount, avgUtilization,
         count(proj) AS projectCount,
         sum(CASE WHEN proj.status = 'active' THEN 1 ELSE 0 END) AS activeProjectCount,
         sum(CASE WHEN proj.status = 'completed' THEN 1 ELSE 0 END) AS completedProjectCount
    MATCH (t:Team)
    WITH peopleCount, availableCount, avgUtilization, projectCount, activeProjectCount, completedProjectCount,
         count(t) AS teamCount
    MATCH (s:Skill)
    WITH peopleCount, availableCount, avgUtilization, projectCount, activeProjectCount, completedProjectCount, teamCount,
         count(s) AS skillCount
    OPTIONAL MATCH (endorser:Person)-[e:ENDORSED]->(p:Person)
    RETURN peopleCount, availableCount, round(avgUtilization * 10) / 10 AS avgUtilization,
           projectCount, activeProjectCount, completedProjectCount, teamCount, skillCount,
           count(DISTINCT e) AS totalEndorsements
    `
  );
  return rows[0] ?? {};
}
