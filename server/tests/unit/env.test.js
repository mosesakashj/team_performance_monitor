import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('env config', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('exports expected properties', async () => {
    process.env.COGNODB_URI = 'bolt://localhost:7687';
    process.env.COGNODB_USER = 'neo4j';
    process.env.COGNODB_PASSWORD = 'password';

    const { env } = await import('../../src/config/env.js');
    expect(env).toHaveProperty('cognodbUri');
    expect(env).toHaveProperty('cognodbUser');
    expect(env).toHaveProperty('cognodbPassword');
    expect(env).toHaveProperty('port');
    expect(env).toHaveProperty('corsOrigin');
    expect(env).toHaveProperty('nodeEnv');
    expect(env).toHaveProperty('isConfigured');
  });

  it('port defaults to 4000', async () => {
    delete process.env.PORT;
    process.env.COGNODB_URI = 'bolt://localhost:7687';
    process.env.COGNODB_USER = 'neo4j';
    process.env.COGNODB_PASSWORD = 'password';

    const { env } = await import('../../src/config/env.js');
    expect(env.port).toBe(4000);
  });

  it('corsOrigin splits comma-separated values', async () => {
    process.env.CORS_ORIGIN = 'http://a.com, http://b.com';
    process.env.COGNODB_URI = 'bolt://localhost:7687';
    process.env.COGNODB_USER = 'neo4j';
    process.env.COGNODB_PASSWORD = 'password';

    const { env } = await import('../../src/config/env.js');
    expect(env.corsOrigin).toEqual(['http://a.com', 'http://b.com']);
  });

  it('isConfigured is true when all required vars are set', async () => {
    process.env.COGNODB_URI = 'bolt://localhost:7687';
    process.env.COGNODB_USER = 'neo4j';
    process.env.COGNODB_PASSWORD = 'password';
    process.env.JWT_SECRET = 'test-secret';

    const { env } = await import('../../src/config/env.js');
    expect(env.isConfigured).toBe(true);
  });
});
