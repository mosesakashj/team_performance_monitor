import * as hierarchyQueries from '../queries/hierarchy.queries.js';

export async function listHierarchy(_req, res) {
  const data = await hierarchyQueries.getOrgHierarchy();
  res.json(data);
}

export async function listEndorsements(req, res) {
  const { skillId, limit, offset } = req.query;
  const data = await hierarchyQueries.getEndorsements(skillId, {
    limit: limit ? Number(limit) : undefined,
    offset: offset ? Number(offset) : undefined,
  });
  res.json(data);
}
