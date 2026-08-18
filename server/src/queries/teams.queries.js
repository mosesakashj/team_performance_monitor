import { runQuery } from '../db/driver.js';

export async function listTeams({ limit = 50, offset = 0 } = {}) {
  const [totalRows, dataRows] = await Promise.all([
    runQuery(
      `
      MATCH (t:Team) RETURN count(t) AS total
      `,
      {}
    ),
    runQuery(
      `
      MATCH (t:Team)
      WITH t
      ORDER BY t.name
      SKIP toInteger($offset) LIMIT toInteger($limit)
      OPTIONAL MATCH (p:Person)-[:MEMBER_OF]->(t)
      OPTIONAL MATCH (t)-[:DELIVERS]->(proj:Project)
      OPTIONAL MATCH (t)-[:BELONGS_TO]->(d:Department)
      WITH t, collect(DISTINCT {personId: p.id, name: p.name, title: p.title, role: m.role, endDate: m.end_date}) AS roster, collect(DISTINCT {projectId: proj.id, name: proj.name, status: proj.status}) AS projects, collect(DISTINCT {departmentId: d.id, departmentName: d.name})[0] AS department
      RETURN t { .* } AS team, roster, projects, department, departmentName: collect(DISTINCT d.name)[0]
      `,
      { offset, limit }
    ),
  ]);

  const total = totalRows[0]?.total ?? 0;
  const teams = dataRows.map((r) => ({
    ...r.team,
    roster: r.roster.length > 0 ? r.roster : [],
    projects: r.projects.length > 0 ? r.projects : [],
    department: r.department ? r.department : undefined,
    departmentName: r.departmentName,
  }));

  return { teams, total };
}

export async function getTeamById(teamId, { limit = 100, offset = 0 } = {}) {
  const rows = await runQuery(
    `
    MATCH (t:Team {id: $teamId})
    OPTIONAL MATCH (p:Person)-[m:MEMBER_OF]->(t)
    WITH t, collect(DISTINCT {personId: p.id, name: p.name, title: p.title, role: m.role, endDate: m.end_date}) AS roster
    OPTIONAL MATCH (t)-[:DELIVERS]->(proj:Project)
    OPTIONAL MATCH (t)-[:BELONGS_TO]->(d:Department)
    RETURN t { .* } AS team, roster, collect(DISTINCT {projectId: proj.id, name: proj.name, status: proj.status}) AS projects, collect(DISTINCT d.name)[0] AS departmentName
    `,
    { teamId }
  );
  return rows[0] ?? null;
}
