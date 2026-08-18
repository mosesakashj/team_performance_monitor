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

    it('throws 400 for query shorter than 2 chars', async () => {
      const req = { query: { q: 'a' } };
      const res = mockRes();

      try {
        await searchController.search(req, res);
        expect.fail('should have thrown');
      } catch (e) {
        expect(e.statusCode).toBe(400);
      }
    });

    it('throws 400 when q is missing', async () => {
      const req = { query: {} };
      const res = mockRes();

      try {
        await searchController.search(req, res);
        expect.fail('should have thrown');
      } catch (e) {
        expect(e.statusCode).toBe(400);
      }
    });
  });
});
