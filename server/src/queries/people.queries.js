import { runQuery } from '../db/driver.js';

/**
 * Paginated, filterable list of people. Powers the People list page.
 *
 * The skill/team filters gather every skill and team id via an unconstrained
 * OPTIONAL MATCH and then filter with list membership, rather than putting
 * {id: $skillId} directly on the OPTIONAL MATCH pattern -- CognoDB silently
 * ignores property constraints (and WHERE clauses) placed on the discovered
 * side of an OPTIONAL MATCH, always returning every match unfiltered.
 */
export async function listPeople({ search, skillId, teamId, availableOnly, limit = 50, offset = 0 }) {
  const params = { search: search ?? null, skillId: skillId ?? null, teamId: teamId ?? null, availableOnly: !!availableOnly, limit, offset };

  const [countRows, dataRows] = await Promise.all([
    runQuery(
      `
      MATCH (p:Person)
      WHERE ($search IS NULL OR toLower(p.name) CONTAINS toLower($search) OR toLower(p.title) CONTAINS toLower($search))
        AND ($availableOnly = false OR p.current_utilization_pct < 100)
      OPTIONAL MATCH (p)-[:HAS_SKILL]->(anySkill:Skill)
      WITH p, collect(DISTINCT anySkill.id) AS skillIds
      OPTIONAL MATCH (p)-[:MEMBER_OF]->(anyTeam:Team)
      WITH p, skillIds, collect(DISTINCT anyTeam.id) AS teamIds
      WHERE ($skillId IS NULL OR $skillId IN skillIds)
        AND ($teamId IS NULL OR $teamId IN teamIds)
      RETURN count(p) AS total
      `,
      params
    ),
    runQuery(
      `
      MATCH (p:Person)
      WHERE ($search IS NULL OR toLower(p.name) CONTAINS toLower($search) OR toLower(p.title) CONTAINS toLower($search))
        AND ($availableOnly = false OR p.current_utilization_pct < 100)
      OPTIONAL MATCH (p)-[:HAS_SKILL]->(anySkill:Skill)
      WITH p, collect(DISTINCT anySkill.id) AS skillIds
      OPTIONAL MATCH (p)-[:MEMBER_OF]->(anyTeam:Team)
      WITH p, skillIds, collect(DISTINCT anyTeam.id) AS teamIds, collect(DISTINCT anyTeam.name)[0] AS primaryTeam
      WHERE ($skillId IS NULL OR $skillId IN skillIds)
        AND ($teamId IS NULL OR $teamId IN teamIds)
      RETURN p { .*, primaryTeam: primaryTeam } AS person
      ORDER BY p.name
      SKIP toInteger($offset) LIMIT toInteger($limit)
      `,
      params
    ),
  ]);

  const total = countRows[0]?.total ?? 0;
  const people = dataRows.map((r) => r.person);
  return { people, total };
}

/** Person detail: profile, skills with proficiency, and full project history. */
export async function getPersonById(personId) {
  const rows = await runQuery(
    `
    MATCH (p:Person {id: $personId})
    OPTIONAL MATCH (p)-[hs:HAS_SKILL]->(s:Skill)
    WITH p, collect(DISTINCT {skillId: s.id, name: s.name, category: s.category, proficiency: hs.proficiency, yearsExperience: hs.years_experience}) AS skills
    OPTIONAL MATCH (p)-[w:WORKED_ON]->(proj:Project)
    WITH p, skills, collect(DISTINCT {projectId: proj.id, name: proj.name, role: w.role, startDate: w.start_date, endDate: w.end_date, allocationPct: w.allocation_pct}) AS projects
    OPTIONAL MATCH (p)-[m:MEMBER_OF]->(team:Team)
    WITH p, skills, projects, collect(DISTINCT {teamId: team.id, name: team.name, role: m.role, startDate: m.start_date, endDate: m.end_date}) AS teams
    RETURN p { .* } AS person, skills, projects, teams
    `,
    { personId }
  );
  return rows[0] ?? null;
}

/** Two-hop collaboration network: direct colleagues (shared projects) and their colleagues. */
export async function getPersonNetwork(personId) {
  return runQuery(
    `
    MATCH (p:Person {id: $personId})-[:WORKED_ON]->(:Project)<-[:WORKED_ON]-(colleague:Person)
    WHERE colleague.id <> $personId
    WITH p, colleague, count(*) AS sharedProjects
    OPTIONAL MATCH (colleague)-[:WORKED_ON]->(:Project)<-[:WORKED_ON]-(extended:Person)
    WITH p, colleague, sharedProjects, extended
    WHERE extended IS NULL OR (extended.id <> $personId AND extended.id <> colleague.id)
    WITH colleague, sharedProjects, collect(DISTINCT extended.id) AS secondDegreeIds
    RETURN colleague { .id, .name, .title, .seniority } AS colleague, sharedProjects, secondDegreeIds
    ORDER BY sharedProjects DESC LIMIT 25
    `,
    { personId }
  );
}

/**
 * Shortest path between two people across mixed relationship types.
 * Variable-length, mixed-relationship traversal is native to Cypher and
 * would need a recursive CTE with manual cycle tracking in SQL.
 */
export async function getShortestPath(personAId, personBId) {
  const rows = await runQuery(
    `
    MATCH (a:Person {id: $personAId}), (b:Person {id: $personBId})
    MATCH path = shortestPath((a)-[:WORKED_ON|MEMBER_OF|ENDORSED*..6]-(b))
    RETURN [n IN nodes(path) | {label: labels(n)[0], id: coalesce(n.id, ''), name: coalesce(n.name, n.id)}] AS pathNodes,
           [r IN relationships(path) | type(r)] AS relTypes,
           length(path) AS hops
    `,
    { personAId, personBId }
  );
  return rows[0] ?? null;
}
