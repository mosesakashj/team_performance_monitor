import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as peopleController from '../../src/controllers/people.controller.js';
import * as peopleQueries from '../../src/queries/people.queries.js';

vi.mock('../../src/queries/people.queries.js');

function mockRes() {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe('people controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listPeople', () => {
    it('returns people and total', async () => {
      const mockResult = { people: [{ id: '1', name: 'Alice' }], total: 1 };
      peopleQueries.listPeople.mockResolvedValue(mockResult);

      const req = { query: {} };
      const res = mockRes();
      await peopleController.listPeople(req, res);

      expect(res.json).toHaveBeenCalledWith(mockResult);
    });
  });

  describe('getPerson', () => {
    it('returns person or throws 404', async () => {
      peopleQueries.getPersonById.mockResolvedValue({ id: '1', name: 'Alice' });

      const req = { params: { id: '1' } };
      const res = mockRes();
      await peopleController.getPerson(req, res);

      expect(res.json).toHaveBeenCalledWith({ id: '1', name: 'Alice' });
    });

    it('throws 404 when person not found', async () => {
      peopleQueries.getPersonById.mockResolvedValue(null);

      const req = { params: { id: 'missing' } };
      const res = mockRes();

      try {
        await peopleController.getPerson(req, res);
        expect.fail('should have thrown');
      } catch (e) {
        expect(e.statusCode).toBe(404);
      }
    });
  });

  describe('getPersonNetwork', () => {
    it('returns colleagues', async () => {
      peopleQueries.getPersonNetwork.mockResolvedValue([{ id: '2', name: 'Bob' }]);

      const req = { params: { id: '1' } };
      const res = mockRes();
      await peopleController.getPersonNetwork(req, res);

      expect(res.json).toHaveBeenCalledWith({ colleagues: [{ id: '2', name: 'Bob' }] });
    });
  });

  describe('getPersonPath', () => {
    it('returns path or throws 404', async () => {
      peopleQueries.getShortestPath.mockResolvedValue({ pathNodes: [] });

      const req = { params: { id: '1', otherId: '2' } };
      const res = mockRes();
      await peopleController.getPersonPath(req, res);

      expect(res.json).toHaveBeenCalledWith({ pathNodes: [] });
    });

    it('throws 404 when no path found', async () => {
      peopleQueries.getShortestPath.mockResolvedValue(null);

      const req = { params: { id: '1', otherId: '2' } };
      const res = mockRes();

      try {
        await peopleController.getPersonPath(req, res);
        expect.fail('should have thrown');
      } catch (e) {
        expect(e.statusCode).toBe(404);
      }
    });
  });
});
