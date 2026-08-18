import { runQuery } from '../db/driver.js';

export async function listSkills({ category } = {}, { limit = 50, offset = 0 } = {}) {
  const [totalRows, dataRows] = await Promise.all([
    runQuery(
      `
      MATCH (s:Skill)
      WHERE ($category IS NULL OR s.category = $category)
      RETURN count(s) AS total
      `,
      { category: category ?? null }
    ),
    runQuery(
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
      { category: category ?? null, offset, limit }
    ),
  ]);

  const total = totalRows[0]?.total ?? 0;
  const skills = dataRows.map((r) => r.skill);
  return { skills, total };
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
