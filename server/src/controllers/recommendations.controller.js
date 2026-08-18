import * as recommendationsQueries from '../queries/recommendations.queries.js';

export async function getSkillRecommendations(req, res) {
  const { limit } = req.query;
  const data = await recommendationsQueries.getSkillRecommendations(req.params.id, {
    limit: limit ? Number(limit) : undefined,
  });
  res.json({ recommendations: data });
}

export async function getProjectRecommendations(req, res) {
  const { limit } = req.query;
  const data = await recommendationsQueries.getProjectRecommendations(req.params.id, {
    limit: limit ? Number(limit) : undefined,
  });
  res.json({ recommendations: data });
}

export async function getTeamCompatibility(req, res) {
  const { personIds } = req.body;
  const data = await recommendationsQueries.getTeamCompatibility(personIds);
  res.json({ compatibility: data });
}

export async function getKnowledgeTransferAlerts(_req, res) {
  const data = await recommendationsQueries.getKnowledgeTransferAlerts();
  res.json({ alerts: data });
}
