import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as recommendationsController from '../../src/controllers/recommendations.controller.js';
import * as recommendationsQueries from '../../src/queries/recommendations.queries.js';

vi.mock('../../src/queries/recommendations.queries.js');

function mockRes() {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe('recommendations controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getSkillRecommendations', () => {
    it('returns recommendations', async () => {
      recommendationsQueries.getSkillRecommendations.mockResolvedValue([{ skill: { name: 'Rust' }, howManyKnow: 3 }]);

      const req = { params: { id: 'p1' }, query: {} };
      const res = mockRes();
      await recommendationsController.getSkillRecommendations(req, res);

      expect(res.json).toHaveBeenCalledWith({ recommendations: [{ skill: { name: 'Rust' }, howManyKnow: 3 }] });
    });
  });

  describe('getProjectRecommendations', () => {
    it('returns recommendations', async () => {
      recommendationsQueries.getProjectRecommendations.mockResolvedValue([{ project: { name: 'Alpha' }, score: 5 }]);

      const req = { params: { id: 'p1' }, query: {} };
      const res = mockRes();
      await recommendationsController.getProjectRecommendations(req, res);

      expect(res.json).toHaveBeenCalledWith({ recommendations: [{ project: { name: 'Alpha' }, score: 5 }] });
    });
  });

  describe('getTeamCompatibility', () => {
    it('returns compatibility', async () => {
      recommendationsQueries.getTeamCompatibility.mockResolvedValue([{ person1: { id: 'a' }, compatibilityScore: 10 }]);

      const req = { body: { personIds: ['a', 'b'] } };
      const res = mockRes();
      await recommendationsController.getTeamCompatibility(req, res);

      expect(res.json).toHaveBeenCalledWith({ compatibility: [{ person1: { id: 'a' }, compatibilityScore: 10 }] });
    });

    it('returns compatibility with single person', async () => {
      recommendationsQueries.getTeamCompatibility.mockResolvedValue([]);

      const req = { body: { personIds: ['a'] } };
      const res = mockRes();
      await recommendationsController.getTeamCompatibility(req, res);

      expect(res.json).toHaveBeenCalledWith({ compatibility: [] });
    });
  });

  describe('getKnowledgeTransferAlerts', () => {
    it('returns alerts', async () => {
      recommendationsQueries.getKnowledgeTransferAlerts.mockResolvedValue([{ skill: { name: 'Rust' }, holderInfo: {} }]);

      const req = {};
      const res = mockRes();
      await recommendationsController.getKnowledgeTransferAlerts(req, res);

      expect(res.json).toHaveBeenCalledWith({ alerts: [{ skill: { name: 'Rust' }, holderInfo: {} }] });
    });
  });
});
