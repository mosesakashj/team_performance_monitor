import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as authController from '../../src/controllers/auth.controller.js';
import * as authQueries from '../../src/queries/auth.queries.js';

vi.mock('../../src/queries/auth.queries.js');

function mockRes() {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe('auth controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('returns token and user on valid credentials', async () => {
      const mockUser = { id: 'u1', email: 'test@example.com', name: 'Test', role: 'member', passwordHash: '$2a$10$hash' };
      authQueries.findUserForAuth.mockResolvedValue(mockUser);
      authQueries.verifyPassword.mockResolvedValue(true);
      authQueries.generateToken.mockReturnValue('mock-token');

      const req = { body: { email: 'test@example.com', password: 'Password1' } };
      const res = mockRes();
      await authController.login(req, res);

      expect(res.json).toHaveBeenCalledWith({
        token: 'mock-token',
        user: { id: 'u1', email: 'test@example.com', name: 'Test', role: 'member' },
      });
    });

    it('throws 401 on invalid email', async () => {
      authQueries.findUserForAuth.mockResolvedValue(null);

      const req = { body: { email: 'wrong@example.com', password: 'Password1' } };
      const res = mockRes();

      try {
        await authController.login(req, res);
        expect.fail('should have thrown');
      } catch (e) {
        expect(e.statusCode).toBe(401);
      }
    });

    it('throws 401 on invalid password', async () => {
      const mockUser = { id: 'u1', email: 'test@example.com', passwordHash: '$2a$10$hash' };
      authQueries.findUserForAuth.mockResolvedValue(mockUser);
      authQueries.verifyPassword.mockResolvedValue(false);

      const req = { body: { email: 'test@example.com', password: 'Wrong' } };
      const res = mockRes();

      try {
        await authController.login(req, res);
        expect.fail('should have thrown');
      } catch (e) {
        expect(e.statusCode).toBe(401);
      }
    });
  });

  describe('register', () => {
    it('creates user and returns token', async () => {
      authQueries.findUserForAuth.mockResolvedValue(null);
      authQueries.createUser.mockResolvedValue({ id: 'u1', email: 'new@example.com', name: 'New', role: 'member' });
      authQueries.generateToken.mockReturnValue('mock-token');

      const req = { body: { email: 'new@example.com', name: 'New', password: 'Password1' } };
      const res = mockRes();
      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        token: 'mock-token',
        user: { id: 'u1', email: 'new@example.com', name: 'New', role: 'member' },
      });
    });

    it('throws 409 on duplicate email', async () => {
      authQueries.findUserForAuth.mockResolvedValue({ id: 'u1', email: 'existing@example.com' });

      const req = { body: { email: 'existing@example.com', name: 'Dup', password: 'Password1' } };
      const res = mockRes();

      try {
        await authController.register(req, res);
        expect.fail('should have thrown');
      } catch (e) {
        expect(e.statusCode).toBe(409);
      }
    });
  });
});
