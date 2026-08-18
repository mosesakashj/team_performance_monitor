import { describe, it, expect, vi } from 'vitest';
import { asyncHandler } from '../../src/middleware/asyncHandler.js';

describe('asyncHandler', () => {
  it('calls the original function with req, res, next', async () => {
    const fn = vi.fn();
    const handler = asyncHandler(fn);
    const req = {};
    const res = {};
    const next = vi.fn();

    await handler(req, res, next);
    expect(fn).toHaveBeenCalledWith(req, res, next);
  });

  it('calls next on rejection', async () => {
    const error = new Error('boom');
    const fn = vi.fn().mockRejectedValue(error);
    const handler = asyncHandler(fn);
    const req = {};
    const res = {};
    const next = vi.fn();

    await handler(req, res, next);
    expect(next).toHaveBeenCalledWith(error);
  });

  it('does not call next on success', async () => {
    const fn = vi.fn().mockResolvedValue(undefined);
    const handler = asyncHandler(fn);
    const req = {};
    const res = {};
    const next = vi.fn();

    await handler(req, res, next);
    expect(next).not.toHaveBeenCalled();
  });
});
