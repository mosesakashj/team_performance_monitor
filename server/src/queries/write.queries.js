import { runQuery } from '../db/driver.js';
import { clearCache } from '../middleware/cache.js';

/**
 * Create a new person.
 */
export async function createPerson(data) {
  const id = crypto.randomUUID();
  await runQuery(
    `
    CREATE (p:Person {
      id: $id,
      name: $name,
      email: $email,
      title: $title,
      seniority: $seniority,
      location: $location,
      timezone: $timezone,
      weekly_capacity_hours: $weekly_capacity_hours,
      current_utilization_pct: $current_utilization_pct,
      available_from: $available_from,
      hourly_cost: $hourly_cost,
      createdAt: datetime()
    })
    `,
    { id, ...data }
  );
  clearCache('/api/people');
  return { id, ...data };
}

/**
 * Update a person by ID.
 */
export async function updatePerson(id, data) {
  const setClauses = Object.keys(data)
    .map((key) => `p.${key} = $${key}`)
    .join(', ');
  if (Object.keys(data).length === 0) return null;

  await runQuery(
    `
    MATCH (p:Person {id: $id})
    SET ${setClauses}, p.updatedAt = datetime()
    `,
    { id, ...data }
  );
  clearCache('/api/people');
  return { id, ...data };
}

/**
 * Soft-delete a person (set status to inactive).
 */
export async function deletePerson(id) {
  await runQuery(
    `
    MATCH (p:Person {id: $id})
    SET p.status = 'inactive', p.deletedAt = datetime()
    `,
    { id }
  );
  clearCache('/api/people');
}

/**
 * Create a new project.
 */
export async function createProject(data) {
  const id = crypto.randomUUID();
  await runQuery(
    `
    CREATE (p:Project {
      id: $id,
      name: $name,
      client_name: $client_name,
      status: $status,
      start_date: $start_date,
      end_date: $end_date,
      budget: $budget,
      priority: $priority,
      description: $description,
      createdAt: datetime()
    })
    `,
    { id, ...data }
  );
  clearCache('/api/projects');
  return { id, ...data };
}

/**
 * Update a project by ID.
 */
export async function updateProject(id, data) {
  const setClauses = Object.keys(data)
    .map((key) => `p.${key} = $${key}`)
    .join(', ');
  if (Object.keys(data).length === 0) return null;

  await runQuery(
    `
    MATCH (p:Project {id: $id})
    SET ${setClauses}, p.updatedAt = datetime()
    `,
    { id, ...data }
  );
  clearCache('/api/projects');
  return { id, ...data };
}

/**
 * Create a new skill.
 */
export async function createSkill(data) {
  const id = crypto.randomUUID();
  await runQuery(
    `
    CREATE (s:Skill {
      id: $id,
      name: $name,
      category: $category
    })
    `,
    { id, ...data }
  );
  clearCache('/api/skills');
  return { id, ...data };
}

/**
 * Update a skill by ID.
 */
export async function updateSkill(id, data) {
  const setClauses = Object.keys(data)
    .map((key) => `s.${key} = $${key}`)
    .join(', ');
  if (Object.keys(data).length === 0) return null;

  await runQuery(
    `
    MATCH (s:Skill {id: $id})
    SET ${setClauses}
    `,
    { id, ...data }
  );
  clearCache('/api/skills');
  return { id, ...data };
}

/**
 * Create a new team.
 */
export async function createTeam(data) {
  const id = crypto.randomUUID();
  await runQuery(
    `
    CREATE (t:Team {
      id: $id,
      name: $name,
      department: $department,
      departmentId: $departmentId
    })
    `,
    { id, ...data }
  );
  clearCache('/api/teams');
  return { id, ...data };
}

/**
 * Update a team by ID.
 */
export async function updateTeam(id, data) {
  const setClauses = Object.keys(data)
    .map((key) => `t.${key} = $${key}`)
    .join(', ');
  if (Object.keys(data).length === 0) return null;

  await runQuery(
    `
    MATCH (t:Team {id: $id})
    SET ${setClauses}
    `,
    { id, ...data }
  );
  clearCache('/api/teams');
  return { id, ...data };
}

/**
 * Create an endorsement between two people.
 */
export async function createEndorsement({ endorserId, endorseeId, skillId, rating, note }) {
  const id = crypto.randomUUID();
  await runQuery(
    `
    MATCH (endorser:Person {id: $endorserId})
    MATCH (endorsee:Person {id: $endorseeId})
    CREATE (endorser)-[e:ENDORSED {
      id: $id,
      skill_id: $skillId,
      rating: $rating,
      note: $note,
      date: date().toString()
    }]->(endorsee)
    RETURN e
    `,
    { id, endorserId, endorseeId, skillId, rating, note }
  );
  clearCache('/api/hierarchy');
  return { id, endorserId, endorseeId, skillId, rating, note };
}

/**
 * Assign a skill to a person.
 */
export async function assignSkill(personId, { skillId, proficiency, years_experience }) {
  await runQuery(
    `
    MATCH (p:Person {id: $personId})
    MATCH (s:Skill {id: $skillId})
    MERGE (p)-[r:HAS_SKILL]->(s)
    SET r.proficiency = $proficiency, r.years_experience = $years_experience
    `,
    { personId, skillId, proficiency, years_experience }
  );
  clearCache('/api/people');
}

/**
 * Remove a skill from a person.
 */
export async function removeSkill(personId, skillId) {
  await runQuery(
    `
    MATCH (p:Person {id: $personId})-[r:HAS_SKILL]->(s:Skill {id: $skillId})
    DELETE r
    `,
    { personId, skillId }
  );
  clearCache('/api/people');
}

/**
 * Assign a person to a project.
 */
export async function assignToProject(personId, projectId, { role, allocation_pct, start_date, end_date }) {
  await runQuery(
    `
    MATCH (p:Person {id: $personId})
    MATCH (proj:Project {id: $projectId})
    CREATE (p)-[r:WORKED_ON {
      role: $role,
      allocation_pct: $allocation_pct,
      start_date: $start_date,
      end_date: $end_date
    }]->(proj)
    `,
    { personId, projectId, role, allocation_pct, start_date, end_date }
  );
  clearCache('/api/projects');
  clearCache('/api/people');
}

/**
 * Remove a person from a project.
 */
export async function removeFromProject(personId, projectId) {
  await runQuery(
    `
    MATCH (p:Person {id: $personId})-[r:WORKED_ON]->(proj:Project {id: $projectId})
    DELETE r
    `,
    { personId, projectId }
  );
  clearCache('/api/projects');
  clearCache('/api/people');
}

/**
 * Assign a person to a team.
 */
export async function assignToTeam(personId, teamId, { role, start_date, end_date }) {
  await runQuery(
    `
    MATCH (p:Person {id: $personId})
    MATCH (t:Team {id: $teamId})
    CREATE (p)-[r:MEMBER_OF {
      role: $role,
      start_date: $start_date,
      end_date: $end_date
    }]->(t)
    `,
    { personId, teamId, role, start_date, end_date }
  );
  clearCache('/api/teams');
  clearCache('/api/people');
}

/**
 * Remove a person from a team.
 */
export async function removeFromTeam(personId, teamId) {
  await runQuery(
    `
    MATCH (p:Person {id: $personId})-[r:MEMBER_OF]->(t:Team {id: $teamId})
    DELETE r
    `,
    { personId, teamId }
  );
  clearCache('/api/teams');
  clearCache('/api/people');
}
