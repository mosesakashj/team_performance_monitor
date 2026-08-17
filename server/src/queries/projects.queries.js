import { runQuery } from '../db/driver.js';

export async function listProjects({ status, teamId, limit = 50, offset = 0 }) {
  const params = { status: status ?? null, teamId: teamId ?? null, limit, offset };

  const [countRows, dataRows] = await Promise.all([
    runQuery(
      `
      MATCH (proj:Project)
      OPTIONAL MATCH (team:Team)-[:DELIVERS]->(proj)
      WITH proj, team
      WHERE ($status IS NULL OR proj.status = $status)
        AND ($teamId IS NULL OR team.id = $teamId)
      RETURN count(DISTINCT proj) AS total
      `,
      params
    ),
    runQuery(
      `
      MATCH (proj:Project)
      OPTIONAL MATCH (team:Team)-[:DELIVERS]->(proj)
      WITH proj, team
      WHERE ($status IS NULL OR proj.status = $status)
        AND ($teamId IS NULL OR team.id = $teamId)
      WITH proj, collect(DISTINCT team.name)[0] AS teamName
      RETURN proj { .*, teamName: teamName } AS project
      ORDER BY proj.priority DESC, proj.start_date DESC
      SKIP toInteger($offset) LIMIT toInteger($limit)
      `,
      params
    ),
  ]);

  const total = countRows[0]?.total ?? 0;
  const projects = dataRows.map((r) => r.project);
  return { projects, total };
}

export async function getProjectById(projectId) {
  const rows = await runQuery(
    `
    MATCH (proj:Project {id: $projectId})
    OPTIONAL MATCH (proj)-[req:REQUIRES_SKILL]->(s:Skill)
    WITH proj, collect(DISTINCT {skillId: s.id, name: s.name, minProficiency: req.min_proficiency, seniorityNeeded: req.seniority_needed, headcountNeeded: req.headcount_needed}) AS requiredSkills
    OPTIONAL MATCH (person:Person)-[w:WORKED_ON]->(proj)
    WITH proj, requiredSkills, collect(DISTINCT {personId: person.id, name: person.name, role: w.role, allocationPct: w.allocation_pct, endDate: w.end_date}) AS staff
    OPTIONAL MATCH (team:Team)-[:DELIVERS]->(proj)
    WITH proj, requiredSkills, staff, collect(DISTINCT team.name)[0] AS teamName
    RETURN proj { .* } AS project, requiredSkills, staff, teamName
    `,
    { projectId }
  );
  return rows[0] ?? null;
}
