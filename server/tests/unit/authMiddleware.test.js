import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authenticate, authorize, optionalAuth } from '../../src/middleware/auth.js';
import * as authQueries from '../../src/queries/auth.queries.js';

vi.mock('../../src/queries/auth.queries.js');

function mockReq(token) {
  return { headers: token ? { authorization: `Bearer ${token}` } : {} };
}

function mockRes() {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe('auth middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('authenticate', () => {
    it('attaches user to req on valid token', async () => {
      const mockUser = { id: 'u1', name: 'Test', role: 'member' };
      authQueries.verifyToken.mockReturnValue({ id: 'u1', email: 'test@example.com', role: 'member' });
      authQueries.findUserById.mockResolvedValue(mockUser);

      const req = mockReq('valid-token');
      const res = mockRes();
      const next = vi.fn();

      await authenticate(req, res, next);

      expect(req.user).toEqual(mockUser);
      expect(next).toHaveBeenCalled();
    });

    it('calls next with 401 when no token', async () => {
      const req = mockReq(null);
      const res = mockRes();
      const next = vi.fn();

      await authenticate(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
    });

    it('calls next with 401 on invalid token', async () => {
      authQueries.verifyToken.mockImplementation(() => { throw new Error('invalid'); });

      const req = mockReq('bad-token');
      const res = mockRes();
      const next = vi.fn();

      await authenticate(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
    });
  });

  describe('authorize', () => {
    it('allows matching role', async () => {
      const req = { user: { id: 'u1', role: 'admin' } };
      const res = mockRes();
      const next = vi.fn();

      authorize('admin', 'manager')(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('calls next with 403 for non-matching role', async () => {
      const req = { user: { id: 'u1', role: 'member' } };
      const res = mockRes();
      const next = vi.fn();

      authorize('admin')(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 403 }));
    });
  });

  describe('optionalAuth', () => {
    it('attaches user when token present', async () => {
      const mockUser = { id: 'u1', name: 'Test' };
      authQueries.verifyToken.mockReturnValue({ id: 'u1' });
      authQueries.findUserById.mockResolvedValue(mockUser);

      const req = mockReq('valid-token');
      const res = mockRes();
      const next = vi.fn();

      await optionalAuth(req, res, next);
      expect(req.user).toEqual(mockUser);
      expect(next).toHaveBeenCalled();
    });

    it('continues without user when no token', async () => {
      const req = mockReq(null);
      const res = mockRes();
      const next = vi.fn();

      await optionalAuth(req, res, next);
      expect(req.user).toBeUndefined();
      expect(next).toHaveBeenCalled();
    });
  });
});
