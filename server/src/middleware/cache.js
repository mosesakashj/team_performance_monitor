import { LRUCache } from 'lru-cache';

const cache = new LRUCache({
  max: 500,
  ttl: 60_000,
  allowStale: false,
  updateAgeOnGet: true,
});

/**
 * In-memory LRU TTL cache middleware for expensive aggregate queries.
 * Evicts least-recently-used entries when max size (500) is reached.
 * @param {number} ttlMs - Time to live in milliseconds (default: 60s)
 */
export function cacheMiddleware(ttlMs = 60_000) {
  return (req, res, next) => {
    const key = `${req.method}:${req.originalUrl}`;
    const cached = cache.get(key);
    if (cached) {
      return res.json(cached);
    }
    const originalJson = res.json.bind(res);
    res.json = (data) => {
      const ttlOptions = ttlMs !== 60_000 ? { ttl: ttlMs } : undefined;
      cache.set(key, data, ttlOptions);
      return originalJson(data);
    };
    next();
  };
}

/**
 * Clear cache entries matching an optional pattern.
 * @param {string} [pattern] - If provided, only clear keys containing this string
 */
export function clearCache(pattern) {
  if (!pattern) {
    cache.clear();
    return;
  }
  for (const key of cache.keys()) {
    if (key.includes(pattern)) cache.delete(key);
  }
}

/** Clear all cache entries */
export function clearAllCache() {
  cache.clear();
}

/** Get cache stats for monitoring */
export function getCacheStats() {
  return {
    size: cache.size,
    max: cache.max,
    hits: cache.info?.().hits ?? 0,
    misses: cache.info?.().misses ?? 0,
  };
}
