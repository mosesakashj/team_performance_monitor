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
 * CognoDB quirk workarounds (documented in README):
 * 1. OPTIONAL MATCH on the discovered side ignores property constraints →
 *    we gather each filter set with an unconstrained OPTIONAL MATCH + collect()
 *    and then filter via list membership ($skillId IN skillIds), which is a
 *    value comparison rather than a graph pattern.
 * 2. Pattern predicates (WHERE on discovered side) don't filter → avoided entirely
 *    in favor of the list-membership approach.
 * 3. Mixing map projection with inline aggregate collapses to null row → aggregates
 *    are computed in their own WITH before the map projection.
 *
 * Structure rationale:
 * - Step 1 (lines 27-29): Find required skills for the project and their
 *   adjacent skills (0-2 hops via RELATED_TO) to build the skill closure.
 * - Step 2 (lines 30-31): UNWIND the raw collection then re-collect with
 *   DISTINCT to normalize the candidate skill set, avoiding CognoDB's
 *   OPTIONAL MATCH quirk where inline constraints on the discovered side
 *   are silently ignored.
 * - Step 3 (lines 32-33): Gather all people currently staffed on the project
 *   via an unconstrained OPTIONAL MATCH (CognoDB handles unconstrained
 *   discovered patterns correctly), then collect their IDs for the
 *   exclusion filter.
 * - Step 4 (lines 34-38): For each candidate skill, find people who have
 *   that skill via HAS_SKILL, filtering out staffed persons and those at
 *   capacity. Aggregations (matchedSkills count, avg proficiency, weighted
 *   score based on skill relevance) are computed in a single WITH block.
 * - Step 5 (lines 41-44): Two-hop collaboration check: find colleagues who
 *   shared projects with the candidate, then compute teamFitBonus as the
 *   count of those colleagues who are also currently staffed on the project.
 *   This bonus rewards candidates who have existing team connections.
 * - Step 6 (lines 45-50): Return the person object with aggregated metrics
 *   and a totalScore that weightedSkill (2x for required, 1x for adjacent)
 *   plus 1.5x teamFitBonus.
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
