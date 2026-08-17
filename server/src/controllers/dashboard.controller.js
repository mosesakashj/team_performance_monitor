import * as dashboardQueries from '../queries/dashboard.queries.js';

export async function getUtilizationHeatmap(_req, res) {
  const data = await dashboardQueries.getUtilizationHeatmap();
  res.json({ heatmap: data });
}

export async function getSkillDistribution(_req, res) {
  const data = await dashboardQueries.getSkillDistribution();
  res.json({ distribution: data });
}

export async function getProjectHealth(_req, res) {
  const data = await dashboardQueries.getProjectHealth();
  res.json({ health: data });
}

export async function getTopBottlenecks(req, res) {
  const { limit } = req.query;
  const data = await dashboardQueries.getTopBottlenecks({ limit: limit ? Number(limit) : undefined });
  res.json({ bottlenecks: data });
}

export async function getGlobalSkillGaps(_req, res) {
  const data = await dashboardQueries.getGlobalSkillGaps();
  res.json({ gaps: data });
}

export async function getActivityFeed(_req, res) {
  const data = await dashboardQueries.getActivityFeed();
  res.json({ feed: data });
}

export async function getEnrichedStats(_req, res) {
  const data = await dashboardQueries.getEnrichedStats();
  res.json(data);
}
