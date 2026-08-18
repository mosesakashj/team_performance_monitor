import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as skillsController from '../../src/controllers/skills.controller.js';
import * as skillQueries from '../../src/queries/skills.queries.js';

vi.mock('../../src/queries/skills.queries.js');

function mockRes() {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe('skills controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listSkills', () => {
    it('returns skills', async () => {
      skillQueries.listSkills.mockResolvedValue([{ id: 's1', name: 'JavaScript' }]);

      const req = { query: {} };
      const res = mockRes();
      await skillsController.listSkills(req, res);

      expect(res.json).toHaveBeenCalledWith({ skills: [{ id: 's1', name: 'JavaScript' }] });
    });
  });

  describe('getSkillAdjacent', () => {
    it('returns adjacent skills', async () => {
      skillQueries.getSkillAdjacent.mockResolvedValue({ id: 's1', name: 'JavaScript', related: [] });

      const req = { params: { id: 's1' } };
      const res = mockRes();
      await skillsController.getSkillAdjacent(req, res);

      expect(res.json).toHaveBeenCalledWith({ id: 's1', name: 'JavaScript', related: [] });
    });

    it('throws 404 when skill not found', async () => {
      skillQueries.getSkillAdjacent.mockResolvedValue(null);

      const req = { params: { id: 'missing' } };
      const res = mockRes();

      try {
        await skillsController.getSkillAdjacent(req, res);
        expect.fail('should have thrown');
      } catch (e) {
        expect(e.statusCode).toBe(404);
      }
    });
  });
});
