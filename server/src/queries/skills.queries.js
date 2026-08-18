import { runQuery } from '../db/driver.js';

export async function listSkills({ category } = {}, { limit = 100, offset = 0 } = {}) {
  const rows = await runQuery(
    `
    MATCH (s:Skill)
    WHERE ($category IS NULL OR s.category = $category)
    WITH s
    ORDER BY s.name
    SKIP toInteger($offset) LIMIT toInteger($limit)
    OPTIONAL MATCH (p:Person)-[:HAS_SKILL]->(s)
    WITH s, count(DISTINCT p) AS peopleCount
    RETURN s { .*, peopleCount: peopleCount } AS skill
    `,
    { category: category ?? null }
  );
  return rows.map((r) => r.skill);
}

/** Skill detail: adjacent skills via the RELATED_TO graph, powers the Skills Explorer. */
export async function getSkillAdjacent(skillId) {
  const rows = await runQuery(
    `
    MATCH (s:Skill {id: $skillId})
    OPTIONAL MATCH (s)-[r:RELATED_TO]-(adj:Skill)
    WITH s, collect(DISTINCT {skillId: adj.id, name: adj.name, strength: r.strength}) AS related
    OPTIONAL MATCH (p:Person)-[:HAS_SKILL]->(s)
    WITH s, related, count(DISTINCT p) AS peopleCount
    RETURN s { .* } AS skill, related, peopleCount
    `,
    { skillId }
  );
  return rows[0] ?? null;
}
