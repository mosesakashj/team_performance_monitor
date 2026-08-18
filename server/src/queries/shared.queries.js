import { runQuery } from '../db/driver.js';

/**
 * Shared bottleneck scoring query used by both analytics and dashboard.
 * Multi-hop: WORKED_ON + MEMBER_OF + ENDORSED, aggregated into a single score.
 */
export async function getBottleneckPeople({ limit = 10 } = {}) {
  return runQuery(
    `
    MATCH (p:Person)
    OPTIONAL MATCH (p)-[:WORKED_ON]->(proj:Project)
    WITH p, count(DISTINCT proj) AS projectCount
    OPTIONAL MATCH (p)-[:MEMBER_OF]->(t:Team)
    WITH p, projectCount, count(DISTINCT t) AS teamCount
    OPTIONAL MATCH (p)<-[e:ENDORSED]-(endorser:Person)
    WITH p, projectCount, teamCount, count(DISTINCT endorser) AS endorsementCount
    OPTIONAL MATCH (p)-[:HAS_SKILL]->(s:Skill)
    WITH p, projectCount, teamCount, endorsementCount, count(DISTINCT s) AS skillCount,
         (projectCount * 2 + teamCount + endorsementCount * 0.5) AS bottleneckScore
    RETURN p { .id, .name, .title, .seniority, .current_utilization_pct } AS person,
           projectCount, teamCount, endorsementCount, skillCount, bottleneckScore
    ORDER BY bottleneckScore DESC
    LIMIT toInteger($limit)
    `,
    { limit }
  );
}
