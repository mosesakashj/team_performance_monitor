import * as hierarchyQueries from '../queries/hierarchy.queries.js';

export async function listHierarchy(_req, res) {
  const data = await hierarchyQueries.getOrgHierarchy();
  res.json(data);
}

export async function listEndorsements(req, res) {
  const { skillId } = req.query;
  const data = await hierarchyQueries.getEndorsements(skillId);
  res.json(data);
}
