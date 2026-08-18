import { AppError } from '../utils/AppError.js';
import * as phaseQueries from '../queries/phases.queries.js';

export async function getProjectPhases(req, res) {
  const phases = await phaseQueries.getProjectPhases(req.params.projectId);
  res.json({ phases });
}

export async function getPhase(req, res) {
  const phase = await phaseQueries.getPhaseById(req.params.id);
  if (!phase) throw new AppError(404, 'Phase not found', 'NOT_FOUND');
  res.json(phase);
}
