import * as reportsQueries from '../queries/reports.queries.js';

export async function getUtilizationReport(_req, res) {
  const report = await reportsQueries.getUtilizationReport();
  res.json({ report });
}

export async function getSkillInventoryReport(_req, res) {
  const report = await reportsQueries.getSkillInventoryReport();
  res.json({ report });
}

export async function getProjectHealthReport(_req, res) {
  const report = await reportsQueries.getProjectHealthReport();
  res.json({ report });
}

export async function getEndorsementReport(_req, res) {
  const report = await reportsQueries.getEndorsementReport();
  res.json({ report });
}
