import { runQuery } from '../db/driver.js';

export async function listTeams() {
  const rows = await runQuery(
    `
    MATCH (t:Team)
    OPTIONAL MATCH (p:Person)-[:MEMBER_OF]->(t)
    OPTIONAL MATCH (t)-[:DELIVERS]->(proj:Project)
    WITH t, count(DISTINCT p) AS memberCount, count(DISTINCT proj) AS projectCount
    RETURN t { .*, memberCount: memberCount, projectCount: projectCount } AS team
    ORDER BY t.name
    `
  );
  return rows.map((r) => r.team);
}

export async function getTeamById(teamId) {
  const rows = await runQuery(
    `
    MATCH (t:Team {id: $teamId})
    OPTIONAL MATCH (p:Person)-[m:MEMBER_OF]->(t)
    WITH t, collect(DISTINCT {personId: p.id, name: p.name, title: p.title, role: m.role, endDate: m.end_date}) AS roster
    OPTIONAL MATCH (t)-[:DELIVERS]->(proj:Project)
    WITH t, roster, collect(DISTINCT {projectId: proj.id, name: proj.name, status: proj.status}) AS projects
    RETURN t { .* } AS team, roster, projects
    `,
    { teamId }
  );
  return rows[0] ?? null;
}
