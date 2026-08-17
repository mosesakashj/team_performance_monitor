import { runQuery } from '../db/driver.js';

/**
 * Flagship query: ranks staffing candidates for a project by combining
 * (a) a skill-adjacency closure (candidates who have a required skill OR
 *     a closely related one, via RELATED_TO up to 2 hops) with
 * (b) a team-fit signal (has this candidate already worked alongside people
 *     currently staffed on the project?).
 *
 * In a relational schema this needs a recursive CTE (to compute the skill
 * closure) nested inside a self-join on project history — awkward and slow.
 * In Cypher it is one continuous pattern match.
 *
 * Note on structure: CognoDB silently ignores any constraint (inline property
 * map, or a reused/pre-bound variable) placed on the *discovered* side of an
 * OPTIONAL MATCH -- it just returns every match of that relationship type
 * unfiltered. So "already staffed on this project" and "worked with someone
 * currently on this project" can't be expressed as OPTIONAL MATCH ...(proj)
 * once proj is bound. Instead we gather each set with an unconstrained
 * OPTIONAL MATCH (anchor -> genuinely fresh variable, which CognoDB handles
 * correctly), collect() it into a list, and filter with list membership,
 * which is a value comparison rather than a graph pattern.
 */
export async function getProjectCandidates(projectId, { limit = 10 } = {}) {
  return runQuery(
    `
    MATCH (proj:Project {id: $projectId})-[:REQUIRES_SKILL]->(reqSkill:Skill)
    OPTIONAL MATCH (reqSkill)-[:RELATED_TO*0..2]-(adjSkill:Skill)
    WITH proj, collect(DISTINCT reqSkill) AS requiredSkills, collect(DISTINCT adjSkill) + collect(DISTINCT reqSkill) AS candidateSkillsRaw
    UNWIND candidateSkillsRaw AS candidateSkill
    WITH proj, requiredSkills, collect(DISTINCT candidateSkill) AS candidateSkills
    OPTIONAL MATCH (proj)<-[:WORKED_ON]-(staffedPerson:Person)
    WITH proj, requiredSkills, candidateSkills, collect(DISTINCT staffedPerson.id) AS staffedPersonIds
    UNWIND candidateSkills AS cs
    MATCH (person:Person)-[hs:HAS_SKILL]->(cs)
    WHERE person.current_utilization_pct < 100 AND NOT person.id IN staffedPersonIds
    WITH person, requiredSkills, staffedPersonIds,
         count(DISTINCT cs) AS matchedSkills,
         avg(hs.proficiency) AS avgProficiency,
         sum(CASE WHEN cs IN requiredSkills THEN 2 ELSE 1 END) AS weightedScore
    OPTIONAL MATCH (person)-[:WORKED_ON]->(:Project)<-[:WORKED_ON]-(colleague:Person)
    WITH person, matchedSkills, avgProficiency, weightedScore, staffedPersonIds, collect(DISTINCT colleague.id) AS colleagueIds
    WITH person, matchedSkills, avgProficiency, weightedScore,
         size([id IN colleagueIds WHERE id IN staffedPersonIds]) AS teamFitBonus
    RETURN person { .id, .name, .title, .seniority, .current_utilization_pct } AS person,
           matchedSkills, avgProficiency, weightedScore, teamFitBonus,
           (weightedScore + teamFitBonus * 1.5) AS totalScore
    ORDER BY totalScore DESC
    LIMIT toInteger($limit)
    `,
    { projectId, limit }
  );
}
