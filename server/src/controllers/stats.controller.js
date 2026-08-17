import { getOverviewStats } from '../queries/stats.queries.js';

export async function stats(req, res) {
  res.json(await getOverviewStats());
}
