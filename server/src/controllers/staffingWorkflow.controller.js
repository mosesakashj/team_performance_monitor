import * as staffingWorkflowQueries from '../queries/staffingWorkflow.queries.js';

export async function createProposal(req, res) {
  const proposal = await staffingWorkflowQueries.createStaffingProposal(req.body);
  res.status(201).json(proposal);
}

export async function getProjectProposals(req, res) {
  const proposals = await staffingWorkflowQueries.getProjectProposals(req.params.projectId);
  res.json({ proposals });
}

export async function approveProposal(req, res) {
  const result = await staffingWorkflowQueries.approveProposal(req.params.id);
  res.json(result);
}

export async function rejectProposal(req, res) {
  await staffingWorkflowQueries.rejectProposal(req.params.id, req.body);
  res.status(204).end();
}

export async function getStaffingSummary(_req, res) {
  const summary = await staffingWorkflowQueries.getStaffingSummary();
  res.json({ summary });
}
