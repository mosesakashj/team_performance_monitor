import * as analyticsQueries from '../queries/analytics.queries.js';
import * as projectQueries from '../queries/projects.queries.js';
import * as teamQueries from '../queries/teams.queries.js';
import { AppError } from '../utils/AppError.js';

export async function getProjectSkillGaps(req, res) {
  const project = await projectQueries.getProjectById(req.params.id);
  if (!project) throw new AppError(404, 'Project not found', 'NOT_FOUND');
  const gaps = await analyticsQueries.getProjectSkillGaps(req.params.id);
  res.json({ gaps });
}

export async function getBottleneckPeople(req, res) {
  const { limit } = req.query;
  const data = await analyticsQueries.getBottleneckPeople({ limit: limit ? Number(limit) : undefined });
  res.json({ bottlenecks: data });
}

export async function getKnowledgeSilos(req, res) {
  const data = await analyticsQueries.getKnowledgeSilos();
  res.json({ silos: data });
}

export async function getTeamComposition(req, res) {
  const team = await teamQueries.getTeamById(req.params.id);
  if (!team) throw new AppError(404, 'Team not found', 'NOT_FOUND');
  const composition = await analyticsQueries.getTeamComposition(req.params.id);
  res.json(composition);
}

export async function getPersonTimeline(req, res) {
  const data = await analyticsQueries.getPersonTimeline(req.params.id);
  res.json(data[0] ?? null);
}

export async function getSkillDemandSupply(req, res) {
  const data = await analyticsQueries.getSkillDemandSupply();
  res.json({ skills: data });
}

export async function getProjectTimeline(req, res) {
  const data = await analyticsQueries.getProjectTimeline();
  res.json({ projects: data });
}
