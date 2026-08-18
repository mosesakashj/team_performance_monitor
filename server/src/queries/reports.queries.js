import { runQuery } from '../db/driver.js';

/**
 * Generate staffing utilization report.
 * Supports optional team and date filters.
 */
export async function getUtilizationReport({ team, startDate, endDate } = {}) {
  let query = `
    MATCH (p:Person)
    OPTIONAL MATCH (p)-[:MEMBER_OF]->(t:Team)
    RETURN p { .id, .name, .title, .seniority, .current_utilization_pct, .weekly_capacity_hours } AS person,
           t { .id, .name } AS team
  `;
  const params = [];
  const conditions = [];

  if (team) {
    conditions.push(`t.id = $${params.length + 1}`);
    params.push(team);
  }

  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(' AND ')}`;
  }

  query += ` ORDER BY p.current_utilization_pct DESC`;
  return runQuery(query, ...params);
}

/**
 * Generate skill inventory report.
 * Supports optional category filter.
 */
export async function getSkillInventoryReport({ category } = {}) {
  let query = `
    MATCH (p:Person)-[hs:HAS_SKILL]->(s:Skill)
    WITH s, collect({
      personId: p.id, name: p.name, title: p.title,
      proficiency: hs.proficiency, years: hs.years_experience
    }) AS holders, count(p) AS holderCount
  `;
  const params = [];
  const conditions = [];

  if (category) {
    conditions.push(`s.category = $${params.length + 1}`);
    params.push(category);
  }

  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(' ')}`;
  }

  query += `
    RETURN s { .id, .name, .category } AS skill,
           holderCount, holders
    ORDER BY s.category, holderCount DESC
  `;
  return runQuery(query, ...params);
}

/**
 * Generate project health report.
 * Supports optional status filter.
 */
export async function getProjectHealthReport({ status } = {}) {
  let query = `
    MATCH (proj:Project)
    OPTIONAL MATCH (person:Person)-[:WORKED_ON]->(proj)
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
  `;
  const params = [];
  const conditions = [];

  if (status) {
    conditions.push(`proj.status = $${params.length + 1}`);
    params.push(status);
  }

  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(' ')}`;
  }

  query += `
    ORDER BY proj.priority DESC, coverageRatio ASC
  `;
  return runQuery(query, ...params);
}

/**
 * Generate endorsement summary report.
 * Supports optional status filter.
 */
export async function getEndorsementReport({ minEndorsements } = {}) {
  let query = `
    MATCH (endorser:Person)-[e:ENDORSED]->(endorsee:Person)
    WITH endorsee, count(e) AS endorsementCount, avg(e.rating) AS avgRating
  `;
  const params = [];
  const conditions = [];

  if (minEndorsements) {
    conditions.push(`count(e) >= $${params.length + 1}`);
    params.push(Number(minEndorsements));
  }

  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(' ')}`;
  }

  query += `
    OPTIONAL MATCH (endorsee)-[:HAS_SKILL]->(s:Skill)
    WITH endorsee, endorsementCount, avgRating, collect(DISTINCT s.name) AS skills
    RETURN endorsee { .id, .name, .title, .seniority } AS person,
           endorsementCount, avgRating, skills
    ORDER BY endorsementCount DESC
  `;
  return runQuery(query, ...params);
}