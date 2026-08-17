import { AppError } from '../utils/AppError.js';
import * as projectQueries from '../queries/projects.queries.js';
import { getProjectCandidates } from '../queries/staffing.queries.js';

export async function listProjects(req, res) {
  const { status, teamId, limit, offset } = req.query;
  const result = await projectQueries.listProjects({
    status,
    teamId,
    limit: limit ? Number(limit) : undefined,
    offset: offset ? Number(offset) : undefined,
  });
  res.json(result);
}

export async function getProject(req, res) {
  const project = await projectQueries.getProjectById(req.params.id);
  if (!project) throw new AppError(404, 'Project not found', 'NOT_FOUND');
  res.json(project);
}

export async function getCandidates(req, res) {
  const project = await projectQueries.getProjectById(req.params.id);
  if (!project) throw new AppError(404, 'Project not found', 'NOT_FOUND');
  const candidates = await getProjectCandidates(req.params.id, {
    limit: req.query.limit ? Number(req.query.limit) : undefined,
  });
  res.json({ candidates });
}
