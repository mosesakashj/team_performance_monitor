import { runQuery } from '../db/driver.js';

/**
 * List all departments with team count and headcount.
 */
export async function listDepartments() {
  return runQuery(
    `
    MATCH (d:Department)
    OPTIONAL MATCH (t:Team)-[:BELONGS_TO]->(d)
    WITH d, count(DISTINCT t) AS teamCount
    OPTIONAL MATCH (p:Person)-[:MEMBER_OF]->(t:Team)-[:BELONGS_TO]->(d)
    WITH d, teamCount, count(DISTINCT p) AS headcount
    RETURN d { .id, .name, .head_count: headcount, teamCount } AS department
    ORDER BY d.name
    `
  );
}

/**
 * Get department detail with teams and members.
 */
export async function getDepartmentById(departmentId) {
  const rows = await runQuery(
    `
    MATCH (d:Department {id: $departmentId})
    OPTIONAL MATCH (t:Team)-[:BELONGS_TO]->(d)
    WITH d, collect(DISTINCT {teamId: t.id, name: t.name}) AS teams
    OPTIONAL MATCH (p:Person)-[:MEMBER_OF]->(t:Team)-[:BELONGS_TO]->(d)
    WITH d, teams, collect(DISTINCT {personId: p.id, name: p.name, title: p.title, utilization: p.current_utilization_pct}) AS members
    RETURN d { .id, .name } AS department, teams, members
    `,
    { departmentId }
  );
  return rows[0] ?? null;
}
