import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as hierarchyController from '../../src/controllers/hierarchy.controller.js';
import * as hierarchyQueries from '../../src/queries/hierarchy.queries.js';

vi.mock('../../src/queries/hierarchy.queries.js');

function mockRes() {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe('hierarchy controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listHierarchy', () => {
    it('returns hierarchy data', async () => {
      const mockData = { topLevel: [], byManager: {}, employees: [] };
      hierarchyQueries.getOrgHierarchy.mockResolvedValue(mockData);

      const req = {};
      const res = mockRes();
      await hierarchyController.listHierarchy(req, res);

      expect(res.json).toHaveBeenCalledWith(mockData);
    });
  });

  describe('listEndorsements', () => {
    it('returns endorsements', async () => {
      const mockData = [{ endorsee: { id: 'p1' }, endorsements: [], endorsementCount: 0 }];
      hierarchyQueries.getEndorsements.mockResolvedValue(mockData);

      const req = { query: {} };
      const res = mockRes();
      await hierarchyController.listEndorsements(req, res);

      expect(res.json).toHaveBeenCalledWith(mockData);
    });
  });
});
