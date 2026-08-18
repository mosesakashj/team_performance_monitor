import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as searchController from '../../src/controllers/search.controller.js';
import * as searchQueries from '../../src/queries/search.queries.js';

vi.mock('../../src/queries/search.queries.js');

function mockRes() {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe('search controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('search', () => {
    it('returns results', async () => {
      searchQueries.globalSearch.mockResolvedValue([{ id: 'p1', label: 'Alice', type: 'Person' }]);

      const req = { query: { q: 'ali' } };
      const res = mockRes();
      await searchController.search(req, res);

      expect(res.json).toHaveBeenCalledWith({ results: [{ id: 'p1', label: 'Alice', type: 'Person' }] });
    });
  });
});
