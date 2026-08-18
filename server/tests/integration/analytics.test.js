import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as analyticsController from '../../src/controllers/analytics.controller.js';
import * as analyticsQueries from '../../src/queries/analytics.queries.js';
import * as projectQueries from '../../src/queries/projects.queries.js';
import * as teamQueries from '../../src/queries/teams.queries.js';

vi.mock('../../src/queries/analytics.queries.js');
vi.mock('../../src/queries/projects.queries.js');
vi.mock('../../src/queries/teams.queries.js');

function mockRes() {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe('analytics controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getProjectSkillGaps', () => {
    it('returns gaps', async () => {
      projectQueries.getProjectById.mockResolvedValue({ id: 'p1', name: 'Alpha' });
      analyticsQueries.getProjectSkillGaps.mockResolvedValue([{ skill: 'JS', coverageCount: 2 }]);

      const req = { params: { id: 'p1' } };
      const res = mockRes();
      await analyticsController.getProjectSkillGaps(req, res);

      expect(res.json).toHaveBeenCalledWith({ gaps: [{ skill: 'JS', coverageCount: 2 }] });
    });

    it('throws 404 when project not found', async () => {
      projectQueries.getProjectById.mockResolvedValue(null);

      const req = { params: { id: 'missing' } };
      const res = mockRes();

      try {
        await analyticsController.getProjectSkillGaps(req, res);
        expect.fail('should have thrown');
      } catch (e) {
        expect(e.statusCode).toBe(404);
      }
    });
  });

  describe('getBottleneckPeople', () => {
    it('returns bottlenecks', async () => {
      analyticsQueries.getBottleneckPeople.mockResolvedValue([{ name: 'Alice', score: 10 }]);

      const req = { query: {} };
      const res = mockRes();
      await analyticsController.getBottleneckPeople(req, res);

      expect(res.json).toHaveBeenCalledWith({ bottlenecks: [{ name: 'Alice', score: 10 }] });
    });
  });

  describe('getKnowledgeSilos', () => {
    it('returns silos', async () => {
      analyticsQueries.getKnowledgeSilos.mockResolvedValue([{ skill: 'Rust' }]);

      const req = {};
      const res = mockRes();
      await analyticsController.getKnowledgeSilos(req, res);

      expect(res.json).toHaveBeenCalledWith({ silos: [{ skill: 'Rust' }] });
    });
  });

  describe('getTeamComposition', () => {
    it('returns composition', async () => {
      teamQueries.getTeamById.mockResolvedValue({ id: 't1', name: 'Alpha' });
      analyticsQueries.getTeamComposition.mockResolvedValue({ team: { id: 't1' }, members: [] });

      const req = { params: { id: 't1' } };
      const res = mockRes();
      await analyticsController.getTeamComposition(req, res);

      expect(res.json).toHaveBeenCalledWith({ team: { id: 't1' }, members: [] });
    });

    it('throws 404 when team not found', async () => {
      teamQueries.getTeamById.mockResolvedValue(null);

      const req = { params: { id: 'missing' } };
      const res = mockRes();

      try {
        await analyticsController.getTeamComposition(req, res);
        expect.fail('should have thrown');
      } catch (e) {
        expect(e.statusCode).toBe(404);
      }
    });
  });

  describe('getPersonTimeline', () => {
    it('returns timeline', async () => {
      analyticsQueries.getPersonTimeline.mockResolvedValue([{ person: { id: 'p1' }, projects: [] }]);

      const req = { params: { id: 'p1' } };
      const res = mockRes();
      await analyticsController.getPersonTimeline(req, res);

      expect(res.json).toHaveBeenCalledWith({ person: { id: 'p1' }, projects: [] });
    });

    it('returns null when no data', async () => {
      analyticsQueries.getPersonTimeline.mockResolvedValue([]);

      const req = { params: { id: 'p1' } };
      const res = mockRes();
      await analyticsController.getPersonTimeline(req, res);

      expect(res.json).toHaveBeenCalledWith(null);
    });
  });

  describe('getSkillDemandSupply', () => {
    it('returns skills', async () => {
      analyticsQueries.getSkillDemandSupply.mockResolvedValue([{ skill: 'JS', ratio: 2 }]);

      const req = {};
      const res = mockRes();
      await analyticsController.getSkillDemandSupply(req, res);

      expect(res.json).toHaveBeenCalledWith({ skills: [{ skill: 'JS', ratio: 2 }] });
    });
  });

  describe('getProjectTimeline', () => {
    it('returns projects', async () => {
      analyticsQueries.getProjectTimeline.mockResolvedValue([{ project: { id: 'p1' }, staff: [] }]);

      const req = {};
      const res = mockRes();
      await analyticsController.getProjectTimeline(req, res);

      expect(res.json).toHaveBeenCalledWith({ projects: [{ project: { id: 'p1' }, staff: [] }] });
    });
  });
});
