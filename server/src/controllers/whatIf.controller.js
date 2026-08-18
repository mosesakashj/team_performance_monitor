import * as whatIfQueries from '../queries/whatIf.queries.js';

export async function simulatePersonRemoval(req, res) {
  const result = await whatIfQueries.simulatePersonRemoval(req.params.personId);
  res.json(result);
}

export async function simulateSkillAddition(req, res) {
  const result = await whatIfQueries.simulateSkillAddition(req.params.personId, req.params.skillId);
  res.json(result);
}
