import { describe, it, expect, vi } from 'vitest';
import { notFoundHandler, errorHandler } from '../../src/middleware/errorHandler.js';
import { AppError } from '../../src/utils/AppError.js';

describe('notFoundHandler', () => {
  it('returns 404 with correct JSON', () => {
    const req = { method: 'GET', path: '/api/foo' };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    notFoundHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: { message: 'No route for GET /api/foo', code: 'NOT_FOUND' },
    });
  });
});

describe('errorHandler', () => {
  it('handles AppError with correct status code', () => {
    const err = new AppError(404, 'not found', 'NOT_FOUND');
    const req = {};
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    const next = vi.fn();

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: { message: 'not found', code: 'NOT_FOUND' },
    });
  });

  it('handles generic errors with 500', () => {
    const err = new Error('unexpected');
    const req = {};
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    const next = vi.fn();

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: { message: 'Something went wrong on our end', code: 'INTERNAL_ERROR' },
    });
  });
});
