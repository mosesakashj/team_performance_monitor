import { runQuery } from '../db/driver.js';
import { clearCache } from '../middleware/cache.js';

/**
 * Staffing proposal: create a staffing proposal for a project.
 */
export async function createStaffingProposal({ projectId, personId, proposedRole, proposedAllocation, notes }) {
  const id = crypto.randomUUID();
  await runQuery(
    `
    MATCH (proj:Project {id: $projectId})
    MATCH (p:Person {id: $personId})
    CREATE (prop:StaffingProposal {
      id: $id,
      projectId: $projectId,
      personId: $personId,
      proposedRole: $proposedRole,
      proposedAllocation: $proposedAllocation,
      notes: $notes,
      status: 'pending',
      createdAt: datetime()
    })
    CREATE (prop)-[:FOR_PROJECT]->(proj)
    CREATE (prop)-[:FOR_PERSON]->(p)
    RETURN prop
    `,
    { id, projectId, personId, proposedRole, proposedAllocation, notes }
  );
  clearCache('/api/staffing');
  return { id, projectId, personId, proposedRole, proposedAllocation, notes, status: 'pending' };
}

/**
 * Get staffing proposals for a project.
 */
export async function getProjectProposals(projectId) {
  return runQuery(
    `
    MATCH (prop:StaffingProposal)-[:FOR_PROJECT]->(proj:Project {id: $projectId})
    MATCH (prop)-[:FOR_PERSON]->(p:Person)
    RETURN prop { .id, .proposedRole, .proposedAllocation, .notes, .status, .createdAt } AS proposal,
           p { .id, .name, .title, .seniority } AS person
    ORDER BY prop.createdAt DESC
    `,
    { projectId }
  );
}

/**
 * Approve a staffing proposal and create the assignment.
 */
export async function approveProposal(proposalId) {
  const rows = await runQuery(
    `
    MATCH (prop:StaffingProposal {id: $proposalId})
    MATCH (prop)-[:FOR_PROJECT]->(proj:Project)
    MATCH (prop)-[:FOR_PERSON]->(p:Person)
    SET prop.status = 'approved', prop.approvedAt = datetime()
    CREATE (p)-[:WORKED_ON {
      role: prop.proposedRole,
      allocation_pct: prop.proposedAllocation,
      start_date: date().toString()
    }]->(proj)
    RETURN prop { .id, .status } AS proposal, p { .id, .name } AS person, proj { .id, .name } AS project
    `,
    { proposalId }
  );
  clearCache('/api/projects');
  clearCache('/api/people');
  clearCache('/api/staffing');
  return rows[0] ?? null;
}

/**
 * Reject a staffing proposal.
 */
export async function rejectProposal(proposalId, { reason } = {}) {
  await runQuery(
    `
    MATCH (prop:StaffingProposal {id: $proposalId})
    SET prop.status = 'rejected', prop.rejectedAt = datetime(), prop.rejectionReason = $reason
    `,
    { proposalId, reason: reason || null }
  );
  clearCache('/api/staffing');
}

/**
 * Get staffing summary: pending, approved, rejected counts per project.
 */
export async function getStaffingSummary() {
  return runQuery(
    `
    MATCH (prop:StaffingProposal)-[:FOR_PROJECT]->(proj:Project)
    WITH proj, prop.status AS status, count(prop) AS count
    RETURN proj { .id, .name } AS project, status, count
    ORDER BY proj.name, status
    `
  );
}
