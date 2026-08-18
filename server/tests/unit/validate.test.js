import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validate } from '../../src/middleware/validate.js';
import { z } from 'zod';

function mockReq(source, data) {
  const req = {};
  req[source] = data;
  req.originalUrl = '/test';
  return req;
}

function mockRes() {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe('validate middleware', () => {
  const querySchema = z.object({ limit: z.coerce.number().int().min(1).max(100).optional() });
  const paramsSchema = z.object({ id: z.string().min(1) });
  const bodySchema = z.object({ name: z.string().min(1) });

  let next;

  beforeEach(() => {
    vi.clearAllMocks();
    next = vi.fn();
  });

  describe('query source (default)', () => {
    it('passes valid query params through', () => {
      const req = mockReq('query', { limit: '10' });
      const res = mockRes();
      validate(querySchema)(req, res, next);
      expect(next).toHaveBeenCalled();
      expect(req.query).toEqual({ limit: 10 });
    });

    it('returns 400 with details for invalid query params', () => {
      const req = mockReq('query', { limit: 'abc' });
      const res = mockRes();
      validate(querySchema)(req, res, next);
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            code: 'VALIDATION_ERROR',
            details: expect.any(Array),
          }),
        })
      );
    });
  });

  describe('params source', () => {
    it('passes valid params through', () => {
      const req = mockReq('params', { id: 'abc-123' });
      const res = mockRes();
      validate(paramsSchema, 'params')(req, res, next);
      expect(next).toHaveBeenCalled();
      expect(req.params).toEqual({ id: 'abc-123' });
    });

    it('returns 400 for invalid params', () => {
      const req = mockReq('params', { id: '' });
      const res = mockRes();
      validate(paramsSchema, 'params')(req, res, next);
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({ code: 'VALIDATION_ERROR' }),
        })
      );
    });
  });

  describe('body source', () => {
    it('passes valid body through', () => {
      const req = mockReq('body', { name: 'Alice' });
      const res = mockRes();
      validate(bodySchema, 'body')(req, res, next);
      expect(next).toHaveBeenCalled();
      expect(req.body).toEqual({ name: 'Alice' });
    });

    it('returns 400 for invalid body', () => {
      const req = mockReq('body', { name: '' });
      const res = mockRes();
      validate(bodySchema, 'body')(req, res, next);
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });
});
