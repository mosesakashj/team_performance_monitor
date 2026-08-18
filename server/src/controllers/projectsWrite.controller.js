import * as writeQueries from '../queries/write.queries.js';

export async function createProject(req, res) {
  const project = await writeQueries.createProject(req.body);
  res.status(201).json(project);
}

export async function updateProject(req, res) {
  const project = await writeQueries.updateProject(req.params.id, req.body);
  res.json(project);
}

export async function assignToProject(req, res) {
  await writeQueries.assignToProject(req.params.id, req.params.projectId, req.body);
  res.status(201).json({ message: 'Assigned to project' });
}

export async function removeFromProject(req, res) {
  await writeQueries.removeFromProject(req.params.id, req.params.projectId);
  res.status(204).end();
}
