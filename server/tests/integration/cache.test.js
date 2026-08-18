import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { cacheMiddleware, clearCache, clearAllCache } from '../../src/middleware/cache.js';

function mockReq(method, originalUrl) {
  return { method, originalUrl, query: {} };
}

function mockRes() {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe('cache middleware', () => {
  beforeEach(() => {
    clearAllCache();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('caches response on first call', () => {
    const req = mockReq('GET', '/api/stats');
    const res = mockRes();
    const next = vi.fn();
    const originalJson = res.json;

    cacheMiddleware(60_000)(req, res, next);
    expect(next).toHaveBeenCalled();

    res.json({ count: 10 });
    expect(originalJson).toHaveBeenCalledWith({ count: 10 });
  });

  it('returns cached response on second call within TTL', () => {
    const req1 = mockReq('GET', '/api/stats');
    const res1 = mockRes();
    const next1 = vi.fn();

    cacheMiddleware(60_000)(req1, res1, next1);
    res1.json({ count: 10 });

    const req2 = mockReq('GET', '/api/stats');
    const res2 = mockRes();
    const next2 = vi.fn();

    cacheMiddleware(60_000)(req2, res2, next2);

    expect(next2).not.toHaveBeenCalled();
    expect(res2.json).toHaveBeenCalledWith({ count: 10 });
  });

  it('expires cache after TTL', () => {
    const req1 = mockReq('GET', '/api/stats');
    const res1 = mockRes();
    const next1 = vi.fn();

    cacheMiddleware(1000)(req1, res1, next1);
    res1.json({ count: 10 });

    vi.advanceTimersByTime(1001);

    const req2 = mockReq('GET', '/api/stats');
    const res2 = mockRes();
    const next2 = vi.fn();

    cacheMiddleware(1000)(req2, res2, next2);

    expect(next2).toHaveBeenCalled();
  });

  it('clearCache removes matching entries', () => {
    const req1 = mockReq('GET', '/api/stats');
    const res1 = mockRes();
    cacheMiddleware(60_000)(req1, res1, vi.fn());
    res1.json({ count: 1 });

    const req2 = mockReq('GET', '/api/dashboard');
    const res2 = mockRes();
    cacheMiddleware(60_000)(req2, res2, vi.fn());
    res2.json({ count: 2 });

    clearCache('stats');

    const req3 = mockReq('GET', '/api/stats');
    const res3 = mockRes();
    const next3 = vi.fn();
    cacheMiddleware(60_000)(req3, res3, next3);
    expect(next3).toHaveBeenCalled();

    const req4 = mockReq('GET', '/api/dashboard');
    const res4 = mockRes();
    const next4 = vi.fn();
    cacheMiddleware(60_000)(req4, res4, next4);
    expect(next4).not.toHaveBeenCalled();
    expect(res4.json).toHaveBeenCalledWith({ count: 2 });
  });

  it('clearAllCache removes all entries', () => {
    const req1 = mockReq('GET', '/api/stats');
    const res1 = mockRes();
    cacheMiddleware(60_000)(req1, res1, vi.fn());
    res1.json({ count: 1 });

    clearAllCache();

    const req2 = mockReq('GET', '/api/stats');
    const res2 = mockRes();
    const next2 = vi.fn();
    cacheMiddleware(60_000)(req2, res2, next2);
    expect(next2).toHaveBeenCalled();
  });
});
