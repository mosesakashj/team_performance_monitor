import { runQuery } from '../db/driver.js';

/**
 * What-if scenario: simulate impact of removing a person.
 * Shows affected projects, teams, and knowledge silos.
 */
export async function simulatePersonRemoval(personId) {
  const [person, affectedProjects, affectedTeams, knowledgeSilos] = await Promise.all([
    runQuery(
      `
      MATCH (p:Person {id: $personId})
      RETURN p { .id, .name, .title, .seniority, .current_utilization_pct } AS person
      `,
      { personId }
    ),
    runQuery(
      `
      MATCH (p:Person {id: $personId})-[w:WORKED_ON]->(proj:Project)
      OPTIONAL MATCH (other:Person)-[:WORKED_ON]->(proj)
      WHERE other.id <> $personId
      WITH proj, collect(DISTINCT other.name) AS remainingStaff, count(DISTINCT other) AS remainingCount
      RETURN proj { .id, .name, .status, .priority } AS project,
             remainingStaff, remainingCount,
             CASE WHEN remainingCount = 0 THEN 'critical' WHEN remainingCount <= 2 THEN 'at-risk' ELSE 'ok' END AS riskLevel
      ORDER BY proj.priority DESC
      `,
      { personId }
    ),
    runQuery(
      `
      MATCH (p:Person {id: $personId})-[:MEMBER_OF]->(t:Team)
      OPTIONAL MATCH (other:Person)-[:MEMBER_OF]->(t)
      WHERE other.id <> $personId
      WITH t, collect(DISTINCT other.name) AS remainingMembers, count(DISTINCT other) AS remainingCount
      RETURN t { .id, .name } AS team, remainingMembers, remainingCount
      `,
      { personId }
    ),
    runQuery(
      `
      MATCH (p:Person {id: $personId})-[:HAS_SKILL]->(s:Skill)
      OPTIONAL MATCH (other:Person)-[:HAS_SKILL]->(s)
      WHERE other.id <> $personId
      WITH s, count(DISTINCT other) AS otherHolders
      WHERE otherHolders = 0
      RETURN s { .id, .name, .category } AS skill
      `,
      { personId }
    ),
  ]);

  return {
    person: person[0]?.person ?? null,
    affectedProjects,
    affectedTeams,
    knowledgeSilos,
    riskScore: affectedProjects.filter((p) => p.riskLevel === 'critical').length * 10 +
               affectedProjects.filter((p) => p.riskLevel === 'at-risk').length * 5 +
               knowledgeSilos.length * 8,
  };
}

/**
 * What-if scenario: simulate impact of adding a skill to a person.
 * Shows potential project fits and team compatibility improvements.
 */
export async function simulateSkillAddition(personId, skillId) {
  const [person, potentialProjects, teamImprovements] = await Promise.all([
    runQuery(
      `
      MATCH (p:Person {id: $personId})
      RETURN p { .id, .name, .title, .seniority } AS person
      `,
      { personId }
    ),
    runQuery(
      `
      MATCH (p:Person {id: $personId})
      MATCH (proj:Project)-[:REQUIRES_SKILL]->(s:Skill {id: $skillId})
      WHERE NOT (p)-[:WORKED_ON]->(proj)
      OPTIONAL MATCH (other:Person)-[:WORKED_ON]->(proj)
      WITH proj, count(DISTINCT other) AS currentStaff
      RETURN proj { .id, .name, .status, .priority } AS project, currentStaff
      ORDER BY proj.priority DESC
      `,
      { personId, skillId }
    ),
    runQuery(
      `
      MATCH (p:Person {id: $personId})-[:MEMBER_OF]->(t:Team)
      MATCH (teammate:Person)-[:MEMBER_OF]->(t)
      WHERE teammate.id <> $personId
      MATCH (teammate)-[:HAS_SKILL]->(s:Skill {id: $skillId})
      RETURN count(DISTINCT teammate) AS teammatesWithSkill
      `,
      { personId, skillId }
    ),
  ]);

  return {
    person: person[0]?.person ?? null,
    potentialProjects,
    teamImprovements: teamImprovements[0] ?? { teammatesWithSkill: 0 },
  };
}
