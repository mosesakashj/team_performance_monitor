import { AppError } from '../utils/AppError.js';
import * as skillQueries from '../queries/skills.queries.js';

export async function listSkills(req, res) {
  const skills = await skillQueries.listSkills({ category: req.query.category });
  res.json({ skills });
}

export async function getSkillAdjacent(req, res) {
  const skill = await skillQueries.getSkillAdjacent(req.params.id);
  if (!skill) throw new AppError(404, 'Skill not found', 'NOT_FOUND');
  res.json(skill);
}
