import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as teamsController from '../../src/controllers/teams.controller.js';
import * as teamQueries from '../../src/queries/teams.queries.js';

vi.mock('../../src/queries/teams.queries.js');

function mockRes() {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe('teams controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listTeams', () => {
    it('returns teams', async () => {
      teamQueries.listTeams.mockResolvedValue([{ id: 't1', name: 'Alpha' }]);

      const req = { query: {} };
      const res = mockRes();
      await teamsController.listTeams(req, res);

      expect(res.json).toHaveBeenCalledWith({ teams: [{ id: 't1', name: 'Alpha' }] });
    });
  });

  describe('getTeam', () => {
    it('returns team', async () => {
      teamQueries.getTeamById.mockResolvedValue({ id: 't1', name: 'Alpha' });

      const req = { params: { id: 't1' } };
      const res = mockRes();
      await teamsController.getTeam(req, res);

      expect(res.json).toHaveBeenCalledWith({ id: 't1', name: 'Alpha' });
    });

    it('throws 404 when team not found', async () => {
      teamQueries.getTeamById.mockResolvedValue(null);

      const req = { params: { id: 'missing' } };
      const res = mockRes();

      try {
        await teamsController.getTeam(req, res);
        expect.fail('should have thrown');
      } catch (e) {
        expect(e.statusCode).toBe(404);
      }
    });
  });
});
