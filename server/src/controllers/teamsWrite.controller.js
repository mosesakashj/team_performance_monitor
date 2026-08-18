import * as writeQueries from '../queries/write.queries.js';

export async function createTeam(req, res) {
  const team = await writeQueries.createTeam(req.body);
  res.status(201).json(team);
}

export async function updateTeam(req, res) {
  const team = await writeQueries.updateTeam(req.params.id, req.body);
  res.json(team);
}

export async function assignToTeam(req, res) {
  await writeQueries.assignToTeam(req.params.id, req.params.teamId, req.body);
  res.status(201).json({ message: 'Assigned to team' });
}

export async function removeFromTeam(req, res) {
  await writeQueries.removeFromTeam(req.params.id, req.params.teamId);
  res.status(204).end();
}
