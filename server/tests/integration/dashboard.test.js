import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as dashboardController from '../../src/controllers/dashboard.controller.js';
import * as dashboardQueries from '../../src/queries/dashboard.queries.js';

vi.mock('../../src/queries/dashboard.queries.js');

function mockRes() {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe('dashboard controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getUtilizationHeatmap', () => {
    it('returns heatmap data', async () => {
      dashboardQueries.getUtilizationHeatmap.mockResolvedValue([{ team: 'Alpha', avgUtil: 75 }]);

      const req = {};
      const res = mockRes();
      await dashboardController.getUtilizationHeatmap(req, res);

      expect(res.json).toHaveBeenCalledWith({ heatmap: [{ team: 'Alpha', avgUtil: 75 }] });
    });
  });

  describe('getSkillDistribution', () => {
    it('returns distribution data', async () => {
      dashboardQueries.getSkillDistribution.mockResolvedValue([{ category: 'frontend', peopleCount: 5 }]);

      const req = {};
      const res = mockRes();
      await dashboardController.getSkillDistribution(req, res);

      expect(res.json).toHaveBeenCalledWith({ distribution: [{ category: 'frontend', peopleCount: 5 }] });
    });
  });

  describe('getProjectHealth', () => {
    it('returns health data', async () => {
      dashboardQueries.getProjectHealth.mockResolvedValue([{ status: 'active', projectCount: 3 }]);

      const req = {};
      const res = mockRes();
      await dashboardController.getProjectHealth(req, res);

      expect(res.json).toHaveBeenCalledWith({ health: [{ status: 'active', projectCount: 3 }] });
    });
  });

  describe('getTopBottlenecks', () => {
    it('returns bottlenecks', async () => {
      dashboardQueries.getTopBottlenecks.mockResolvedValue([{ name: 'Alice', score: 10 }]);

      const req = { query: {} };
      const res = mockRes();
      await dashboardController.getTopBottlenecks(req, res);

      expect(res.json).toHaveBeenCalledWith({ bottlenecks: [{ name: 'Alice', score: 10 }] });
    });
  });

  describe('getGlobalSkillGaps', () => {
    it('returns gaps', async () => {
      dashboardQueries.getGlobalSkillGaps.mockResolvedValue([{ skill: 'Rust', ratio: 3 }]);

      const req = {};
      const res = mockRes();
      await dashboardController.getGlobalSkillGaps(req, res);

      expect(res.json).toHaveBeenCalledWith({ gaps: [{ skill: 'Rust', ratio: 3 }] });
    });
  });

  describe('getActivityFeed', () => {
    it('returns feed', async () => {
      dashboardQueries.getActivityFeed.mockResolvedValue([{ type: 'endorsement', actor: 'Alice' }]);

      const req = {};
      const res = mockRes();
      await dashboardController.getActivityFeed(req, res);

      expect(res.json).toHaveBeenCalledWith({ feed: [{ type: 'endorsement', actor: 'Alice' }] });
    });
  });

  describe('getEnrichedStats', () => {
    it('returns enriched stats', async () => {
      const mockData = { peopleCount: 10, projectCount: 5 };
      dashboardQueries.getEnrichedStats.mockResolvedValue(mockData);

      const req = {};
      const res = mockRes();
      await dashboardController.getEnrichedStats(req, res);

      expect(res.json).toHaveBeenCalledWith(mockData);
    });
  });
});
