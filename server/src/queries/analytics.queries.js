import { runQuery } from '../db/driver.js';

/**
 * Skill gap analysis for a project: which required skills (and their adjacencies)
 * are covered by current staff, and which are gaps?
 * Uses RELATED_TO*0..2 for skill adjacency closure.
 */
export async function getProjectSkillGaps(projectId) {
  const rows = await runQuery(
    `
    MATCH (proj:Project {id: $projectId})-[:REQUIRES_SKILL]->(reqSkill:Skill)
    OPTIONAL MATCH (reqSkill)-[:RELATED_TO*0..2]-(adjSkill:Skill)
    WITH proj, reqSkill, collect(DISTINCT adjSkill) + collect(DISTINCT reqSkill) AS allSkillOptions
    UNWIND allSkillOptions AS skillOption
    WITH proj, reqSkill, collect(DISTINCT skillOption) AS skillOptions
    OPTIONAL MATCH (proj)<-[:WORKED_ON]-(staff:Person)-[hs:HAS_SKILL]->(coveredSkill:Skill)
    WITH reqSkill, skillOptions, collect(DISTINCT {personId: staff.id, name: staff.name, skill: coveredSkill.name, proficiency: hs.proficiency}) AS staffCoverages
    UNWIND skillOptions AS so
    WITH reqSkill, staffCoverages, so
    WHERE so.id IN [s IN staffCoverages | s.skill]
    WITH reqSkill, staffCoverages, collect(DISTINCT so.name) AS coveredNames
    WITH reqSkill, coveredNames, staffCoverages, size(coveredNames) AS coverageCount
    RETURN reqSkill { .id, .name, .category, .min_proficiency, .seniority_needed, .headcount_needed, coverageCount: coverageCount, coveredBy: [s IN staffCoverages WHERE s.skill IN coveredNames] } AS skillGap
    ORDER BY skillGap.coverageCount ASC
    `,
    { projectId }
  );
  return rows.map((r) => r.skillGap);
}

/**
 * People with the most project connections and endorsements — potential bottlenecks.
 * Multi-hop: WORKED_ON + MEMBER_OF + ENDORSED, aggregated into a single score.
 */
export async function getBottleneckPeople({ limit = 10 } = {}) {
  return runQuery(
    `
    MATCH (p:Person)
    OPTIONAL MATCH (p)-[:WORKED_ON]->(proj:Project)
    WITH p, count(DISTINCT proj) AS projectCount
    OPTIONAL MATCH (p)-[:MEMBER_OF]->(team:Team)
    WITH p, projectCount, count(DISTINCT team) AS teamCount
    OPTIONAL MATCH (p)<-[e:ENDORSED]-(endorser:Person)
    WITH p, projectCount, teamCount, count(DISTINCT endorser) AS endorsementCount
    OPTIONAL MATCH (p)-[:HAS_SKILL]->(s:Skill)
    WITH p, projectCount, teamCount, endorsementCount, count(DISTINCT s) AS skillCount
    WITH p, projectCount, teamCount, endorsementCount, skillCount,
         (projectCount * 2 + teamCount + endorsementCount * 0.5) AS bottleneckScore
    RETURN p { .id, .name, .title, .seniority, .current_utilization_pct } AS person,
           projectCount, teamCount, endorsementCount, skillCount, bottleneckScore
    ORDER BY bottleneckScore DESC
    LIMIT toInteger($limit)
    `,
    { limit }
  );
}

/**
 * People with unique skills — knowledge silos where only one person has a skill.
 * These are single points of failure for the organization.
 */
export async function getKnowledgeSilos() {
  return runQuery(
    `
    MATCH (p:Person)-[hs:HAS_SKILL]->(s:Skill)
    WITH s, collect({personId: p.id, name: p.name, proficiency: hs.proficiency}) AS holders, count(p) AS holderCount
    WHERE holderCount = 1
    WITH s, holders
    RETURN s { .id, .name, .category } AS skill,
           holders[0] AS soleHolder,
           holders[0].proficiency AS proficiency
    ORDER BY s.category, s.name
    `
  );
}

/**
 * Team composition analysis: skills, utilization, collaboration patterns.
 * Uses WORKED_ON to compute cross-team collaboration history.
 */
export async function getTeamComposition(teamId) {
  const rows = await runQuery(
    `
    MATCH (t:Team {id: $teamId})
    OPTIONAL MATCH (p:Person)-[m:MEMBER_OF]->(t)
    WITH t, collect(DISTINCT {personId: p.id, name: p.name, title: p.title, role: m.role, utilization: p.current_utilization_pct}) AS members
    UNWIND members AS member
    OPTIONAL MATCH (person:Person {id: member.personId})-[hs:HAS_SKILL]->(s:Skill)
    WITH t, members, member, collect(DISTINCT {name: s.name, category: s.category, proficiency: hs.proficiency}) AS memberSkills
    WITH t, members,
         collect({personId: member.personId, name: member.name, title: member.title, role: member.role, utilization: member.utilization, skills: memberSkills}) AS enrichedMembers
    OPTIONAL MATCH (p1:Person)-[:MEMBER_OF]->(t)
    OPTIONAL MATCH (p2:Person)-[:MEMBER_OF]->(t)
    WHERE p1.id < p2.id
    OPTIONAL MATCH (p1)-[:WORKED_ON]->(proj:Project)<-[:WORKED_ON]-(p2)
    WITH enrichedMembers, t, collect(DISTINCT {p1: p1.name, p2: p2.name, sharedProjects: count(proj)}) AS collabPairs
    RETURN t { .* } AS team, enrichedMembers AS members, collabPairs AS collaborationPairs
    `,
    { teamId }
  );
  return rows[0] ?? null;
}

/**
 * Person career timeline: ordered project history + team history + skill endorsements.
 * Powers the redesigned person detail timeline view.
 */
export async function getPersonTimeline(personId) {
  return runQuery(
    `
    MATCH (p:Person {id: $personId})
    OPTIONAL MATCH (p)-[w:WORKED_ON]->(proj:Project)
    OPTIONAL MATCH (p)-[m:MEMBER_OF]->(team:Team)
    OPTIONAL MATCH (endorser:Person)-[e:ENDORSED]->(p)
    WITH p,
         collect(DISTINCT {type: 'project', name: proj.name, projectId: proj.id, role: w.role, startDate: w.start_date, endDate: w.end_date, allocation: w.allocation_pct}) AS projects,
         collect(DISTINCT {type: 'team', name: team.name, teamId: team.id, role: m.role, startDate: m.start_date, endDate: m.end_date}) AS teams,
         collect(DISTINCT {type: 'endorsement', endorser: endorser.name, endorserId: endorser.id, date: e.date, note: e.note}) AS endorsements
    RETURN p { .id, .name, .title, .seniority } AS person,
           [x IN projects WHERE x.name IS NOT NULL] AS projects,
           [x IN teams WHERE x.name IS NOT NULL] AS teams,
           [x IN endorsements WHERE x.endorser IS NOT NULL] AS endorsements
    `
  );
}

/**
 * Skill demand vs supply: how many people have each skill vs how many projects need it.
 * Highlights skills that are in high demand but short supply.
 */
export async function getSkillDemandSupply() {
  return runQuery(
    `
    MATCH (s:Skill)
    OPTIONAL MATCH (p:Person)-[hs:HAS_SKILL]->(s)
    WITH s, count(DISTINCT p) AS supplyCount, avg(hs.proficiency) AS avgProficiency
    OPTIONAL MATCH (proj:Project)-[req:REQUIRES_SKILL]->(s)
    WITH s, supplyCount, avgProficiency, count(DISTINCT proj) AS demandCount,
         collect(DISTINCT proj.name) AS neededByProjects
    WITH s, supplyCount, avgProficiency, demandCount, neededByProjects,
         CASE WHEN supplyCount > 0 THEN toFloat(demandCount) / supplyCount ELSE demandCount * 10.0 END AS ratio
    RETURN s { .id, .name, .category } AS skill,
           supplyCount, demandCount, avgProficiency, ratio,
           neededByProjects[0..5] AS neededByProjects
    ORDER BY ratio DESC, demandCount DESC
    `
  );
}

/**
 * Project timeline data for Gantt-style visualization.
 * Returns all projects with their date ranges and staff allocation.
 */
export async function getProjectTimeline() {
  return runQuery(
    `
    MATCH (proj:Project)
    OPTIONAL MATCH (person:Person)-[w:WORKED_ON]->(proj)
    WITH proj, collect(DISTINCT {personId: person.id, name: person.name, allocation: w.allocation_pct}) AS staff
    RETURN proj { .id, .name, .status, .start_date, .end_date, .priority, .client_name } AS project,
           staff
    ORDER BY proj.start_date ASC
    `
  );
}
