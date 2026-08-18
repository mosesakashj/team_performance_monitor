import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as statsController from '../../src/controllers/stats.controller.js';
import * as statsQueries from '../../src/queries/stats.queries.js';

vi.mock('../../src/queries/stats.queries.js');

function mockRes() {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe('stats controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('stats', () => {
    it('returns overview data', async () => {
      const mockData = { peopleCount: 10, projectCount: 5, teamCount: 3, skillCount: 20 };
      statsQueries.getOverviewStats.mockResolvedValue(mockData);

      const req = {};
      const res = mockRes();
      await statsController.stats(req, res);

      expect(res.json).toHaveBeenCalledWith(mockData);
    });
  });
});
