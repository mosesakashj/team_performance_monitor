import { runQuery } from '../db/driver.js';

/**
 * Suggested skills for a person: skills their collaborators have but they don't.
 * Multi-hop: follows WORKED_ON to find collaborators, then their HAS_SKILL.
 */
export async function getSkillRecommendations(personId, { limit = 8 } = {}) {
  return runQuery(
    `
    MATCH (p:Person {id: $personId})-[:WORKED_ON]->(:Project)<-[:WORKED_ON]-(collaborator:Person)
    WHERE collaborator.id <> $personId
    WITH DISTINCT collaborator
    MATCH (collaborator)-[hs:HAS_SKILL]->(s:Skill)
    WHERE NOT (p)-[:HAS_SKILL]->(s)
    WITH s, count(DISTINCT collaborator) AS howManyKnow, avg(hs.proficiency) AS avgProf
    RETURN s { .id, .name, .category } AS skill, howManyKnow, avgProf
    ORDER BY howManyKnow DESC, avgProf DESC
    LIMIT toInteger($limit)
    `,
    { personId, limit }
  );
}

/**
 * Suggested projects for a person: projects that match their skills but they haven't worked on.
 * Combines skill match + availability + team fit.
 */
export async function getProjectRecommendations(personId, { limit = 5 } = {}) {
  return runQuery(
    `
    MATCH (p:Person {id: $personId})-[:HAS_SKILL]->(s:Skill)
    WITH p, collect(DISTINCT s) AS mySkills
    MATCH (proj:Project)-[:REQUIRES_SKILL]->(reqSkill:Skill)
    WHERE NOT (p)-[:WORKED_ON]->(proj)
    WITH p, mySkills, proj, collect(DISTINCT reqSkill) AS reqSkills
    UNWIND reqSkills AS rs
    WITH p, mySkills, proj, rs, mySkills AS ms
    WHERE rs IN ms
    WITH p, proj, count(DISTINCT rs) AS matchedSkills
    OPTIONAL MATCH (p)-[:WORKED_ON]->(:Project)<-[:WORKED_ON]-(colleague:Person)-[:WORKED_ON]->(proj)
    WITH p, proj, matchedSkills, count(DISTINCT colleague) AS teamFit
    WHERE proj.status = 'active' OR proj.status = 'proposed'
    RETURN proj { .id, .name, .status, .priority, .client_name } AS project,
           matchedSkills, teamFit,
           (matchedSkills * 2 + teamFit * 1.5) AS score
    ORDER BY score DESC
    LIMIT toInteger($limit)
    `,
    { personId, limit }
  );
}

/**
 * Team compatibility score: given a set of people, how compatible are they?
 * Based on shared skills, past collaboration, and skill complementarity.
 */
export async function getTeamCompatibility(personIds) {
  if (!personIds || personIds.length < 2) return null;

  const rows = await runQuery(
    `
    MATCH (p1:Person) WHERE p1.id IN $personIds
    MATCH (p2:Person) WHERE p2.id IN $personIds AND p2.id > p1.id
    OPTIONAL MATCH (p1)-[:WORKED_ON]->(:Project)<-[:WORKED_ON]-(p2)
    WITH p1, p2, count(DISTINCT $dummy) AS sharedProjects
    OPTIONAL MATCH (p1)-[hs1:HAS_SKILL]->(s:Skill)<-[hs2:HAS_SKILL]-(p2)
    WITH p1, p2, sharedProjects, count(DISTINCT s) AS sharedSkills
    OPTIONAL MATCH (p1)-[hs1:HAS_SKILL]->(s1:Skill)
    OPTIONAL MATCH (p2)-[hs2:HAS_SKILL]->(s2:Skill)
    WITH p1, p2, sharedProjects, sharedSkills, count(DISTINCT s1) AS p1SkillCount, count(DISTINCT s2) AS p2SkillCount
    WITH p1, p2, sharedProjects, sharedSkills,
         CASE WHEN p1SkillCount + p2SkillCount > 0
           THEN toFloat(sharedSkills * 2) / (p1SkillCount + p2SkillCount)
           ELSE 0 END AS skillOverlap,
         sharedProjects * 2 + sharedSkills AS compatibilityScore
    RETURN p1 { .id, .name } AS person1, p2 { .id, .name } AS person2,
           sharedProjects, sharedSkills, skillOverlap, compatibilityScore
    ORDER BY compatibilityScore DESC
    `,
    { personIds, dummy: 'x' }
  );
  return rows;
}

/**
 * Knowledge transfer alerts: people with unique skills who are highly utilized.
 */
export async function getKnowledgeTransferAlerts() {
  return runQuery(
    `
    MATCH (p:Person)-[hs:HAS_SKILL]->(s:Skill)
    WITH s, collect({personId: p.id, name: p.name, utilization: p.current_utilization_pct, proficiency: hs.proficiency}) AS holders, count(p) AS holderCount
    WHERE holderCount = 1
    WITH holders[0] AS holder, s { .id, .name, .category } AS skill
    WHERE holder.utilization > 80
    RETURN skill, holder { .personId, .name, .utilization, .proficiency } AS holderInfo
    ORDER BY holder.utilization DESC
    `
  );
}
