import { AppError } from '../utils/AppError.js';
import * as skillQueries from '../queries/skills.queries.js';

export async function listSkills(req, res) {
  const { limit, offset, category } = req.query;
  const result = await skillQueries.listSkills(
    { category },
    { limit: limit ? Number(limit) : undefined, offset: offset ? Number(offset) : undefined },
  );
  res.json(result);
}

export async function getSkillAdjacent(req, res) {
  const skill = await skillQueries.getSkillAdjacent(req.params.id);
  if (!skill) throw new AppError(404, 'Skill not found', 'NOT_FOUND');
  res.json(skill);
}
