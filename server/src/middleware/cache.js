const cache = new Map();

/**
 * In-memory TTL cache middleware for expensive aggregate queries.
 * @param {number} ttlMs - Time to live in milliseconds (default: 60s)
 */
export function cacheMiddleware(ttlMs = 60_000) {
  return (req, res, next) => {
    const key = `${req.method}:${req.originalUrl}`;
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < ttlMs) {
      return res.json(cached.data);
    }
    const originalJson = res.json.bind(res);
    res.json = (data) => {
      cache.set(key, { data, timestamp: Date.now() });
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
  for (const key of cache.keys()) {
    if (!pattern || key.includes(pattern)) cache.delete(key);
  }
}

/** Clear all cache entries */
export function clearAllCache() {
  cache.clear();
}
