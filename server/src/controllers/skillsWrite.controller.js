import * as writeQueries from '../queries/write.queries.js';

export async function createSkill(req, res) {
  const skill = await writeQueries.createSkill(req.body);
  res.status(201).json(skill);
}

export async function updateSkill(req, res) {
  const skill = await writeQueries.updateSkill(req.params.id, req.body);
  res.json(skill);
}
