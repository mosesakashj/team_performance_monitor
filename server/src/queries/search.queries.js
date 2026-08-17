import { runQuery } from '../db/driver.js';

/** Global autocomplete across people, projects, and skills. */
export async function globalSearch(q) {
  return runQuery(
    `
    CALL {
      MATCH (p:Person) WHERE toLower(p.name) CONTAINS toLower($q)
      RETURN p.id AS id, p.name AS label, 'Person' AS type
      UNION
      MATCH (proj:Project) WHERE toLower(proj.name) CONTAINS toLower($q)
      RETURN proj.id AS id, proj.name AS label, 'Project' AS type
      UNION
      MATCH (s:Skill) WHERE toLower(s.name) CONTAINS toLower($q)
      RETURN s.id AS id, s.name AS label, 'Skill' AS type
    }
    RETURN id, label, type
    LIMIT 20
    `,
    { q }
  );
}
