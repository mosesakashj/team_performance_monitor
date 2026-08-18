import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as projectsController from '../../src/controllers/projects.controller.js';
import * as projectQueries from '../../src/queries/projects.queries.js';
import * as staffingQueries from '../../src/queries/staffing.queries.js';

vi.mock('../../src/queries/projects.queries.js');
vi.mock('../../src/queries/staffing.queries.js');

function mockRes() {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe('projects controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listProjects', () => {
    it('returns projects and total', async () => {
      const mockResult = { projects: [{ id: 'p1', name: 'Alpha' }], total: 1 };
      projectQueries.listProjects.mockResolvedValue(mockResult);

      const req = { query: {} };
      const res = mockRes();
      await projectsController.listProjects(req, res);

      expect(res.json).toHaveBeenCalledWith(mockResult);
    });
  });

  describe('getProject', () => {
    it('returns project', async () => {
      projectQueries.getProjectById.mockResolvedValue({ id: 'p1', name: 'Alpha' });

      const req = { params: { id: 'p1' } };
      const res = mockRes();
      await projectsController.getProject(req, res);

      expect(res.json).toHaveBeenCalledWith({ id: 'p1', name: 'Alpha' });
    });

    it('throws 404 when project not found', async () => {
      projectQueries.getProjectById.mockResolvedValue(null);

      const req = { params: { id: 'missing' } };
      const res = mockRes();

      try {
        await projectsController.getProject(req, res);
        expect.fail('should have thrown');
      } catch (e) {
        expect(e.statusCode).toBe(404);
      }
    });
  });

  describe('getCandidates', () => {
    it('returns candidates', async () => {
      projectQueries.getProjectById.mockResolvedValue({ id: 'p1', name: 'Alpha' });
      staffingQueries.getProjectCandidates.mockResolvedValue([{ id: 'person1', name: 'Bob' }]);

      const req = { params: { id: 'p1' }, query: {} };
      const res = mockRes();
      await projectsController.getCandidates(req, res);

      expect(res.json).toHaveBeenCalledWith({ candidates: [{ id: 'person1', name: 'Bob' }] });
    });

    it('throws 404 when project not found', async () => {
      projectQueries.getProjectById.mockResolvedValue(null);

      const req = { params: { id: 'missing' }, query: {} };
      const res = mockRes();

      try {
        await projectsController.getCandidates(req, res);
        expect.fail('should have thrown');
      } catch (e) {
        expect(e.statusCode).toBe(404);
      }
    });
  });
});
