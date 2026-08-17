import { AppError } from '../utils/AppError.js';
import { globalSearch } from '../queries/search.queries.js';

export async function search(req, res) {
  const q = req.query.q;
  if (!q || q.trim().length < 2) {
    throw new AppError(400, 'Query parameter "q" must be at least 2 characters', 'INVALID_QUERY');
  }
  const results = await globalSearch(q.trim());
  res.json({ results });
}
