import { runQuery } from '../db/driver.js';

/**
 * Generate staffing utilization report.
 */
export async function getUtilizationReport() {
  return runQuery(
    `
    MATCH (p:Person)
    OPTIONAL MATCH (p)-[:MEMBER_OF]->(t:Team)
    RETURN p { .id, .name, .title, .seniority, .current_utilization_pct, .weekly_capacity_hours } AS person,
           t { .id, .name } AS team
    ORDER BY p.current_utilization_pct DESC
    `
  );
}

/**
 * Generate skill inventory report.
 */
export async function getSkillInventoryReport() {
  return runQuery(
    `
    MATCH (p:Person)-[hs:HAS_SKILL]->(s:Skill)
    WITH s, collect({
      personId: p.id, name: p.name, title: p.title,
      proficiency: hs.proficiency, years: hs.years_experience
    }) AS holders, count(p) AS holderCount
    RETURN s { .id, .name, .category } AS skill,
           holderCount, holders
    ORDER BY s.category, holderCount DESC
    `
  );
}

/**
 * Generate project health report.
 */
export async function getProjectHealthReport() {
  return runQuery(
    `
    MATCH (proj:Project)
    OPTIONAL MATCH (person:Person)-[w:WORKED_ON]->(proj)
    WITH proj, collect(DISTINCT {personId: person.id, name: person.name, role: w.role, allocation: w.allocation_pct}) AS staff
    OPTIONAL MATCH (proj)-[:REQUIRES_SKILL]->(s:Skill)
    WITH proj, staff, collect(DISTINCT s.name) AS requiredSkills
    OPTIONAL MATCH (person)-[:WORKED_ON]->(proj)
    MATCH (person)-[:HAS_SKILL]->(skill:Skill)
    WHERE skill.name IN requiredSkills
    WITH proj, staff, requiredSkills, collect(DISTINCT skill.name) AS coveredSkills
    RETURN proj { .id, .name, .status, .priority, .start_date, .end_date, .client_name } AS project,
           staff,
           requiredSkills,
           coveredSkills,
           size(coveredSkills) AS coveredCount,
           size(requiredSkills) AS requiredCount,
           CASE WHEN size(requiredSkills) > 0
             THEN toFloat(size(coveredSkills)) / size(requiredSkills)
             ELSE 1.0 END AS coverageRatio
    ORDER BY proj.priority DESC, coverageRatio ASC
    `
  );
}

/**
 * Generate endorsement summary report.
 */
export async function getEndorsementReport() {
  return runQuery(
    `
    MATCH (endorser:Person)-[e:ENDORSED]->(endorsee:Person)
    WITH endorsee, count(e) AS endorsementCount, avg(e.rating) AS avgRating
    OPTIONAL MATCH (endorsee)-[:HAS_SKILL]->(s:Skill)
    WITH endorsee, endorsementCount, avgRating, collect(DISTINCT s.name) AS skills
    RETURN endorsee { .id, .name, .title, .seniority } AS person,
           endorsementCount, avgRating, skills
    ORDER BY endorsementCount DESC
    `
  );
}
