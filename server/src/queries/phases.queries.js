import { runQuery } from '../db/driver.js';

/**
 * List all project phases for a project.
 */
export async function getProjectPhases(projectId) {
  return runQuery(
    `
    MATCH (proj:Project {id: $projectId})-[:HAS_PHASE]->(phase:ProjectPhase)
    RETURN phase { .id, .name, .start_date, .end_date, .status, .deliverables } AS phase
    ORDER BY phase.start_date ASC
    `,
    { projectId }
  );
}

/**
 * Get a specific phase by ID.
 */
export async function getPhaseById(phaseId) {
  const rows = await runQuery(
    `
    MATCH (phase:ProjectPhase {id: $phaseId})
    OPTIONAL MATCH (proj:Project)-[:HAS_PHASE]->(phase)
    RETURN phase { .id, .name, .start_date, .end_date, .status, .deliverables } AS phase,
           proj { .id, .name } AS project
    `,
    { phaseId }
  );
  return rows[0] ?? null;
}
