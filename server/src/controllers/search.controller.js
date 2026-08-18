import { globalSearch } from '../queries/search.queries.js';

export async function search(req, res) {
  const results = await globalSearch(req.query.q.trim());
  res.json({ results });
}
