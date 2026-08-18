import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockExecuteQuery = vi.fn();
const mockVerifyConnectivity = vi.fn();
const mockClose = vi.fn();

vi.mock('neo4j-driver', () => ({
  default: {
    driver: vi.fn(() => ({
      executeQuery: mockExecuteQuery,
      verifyConnectivity: mockVerifyConnectivity,
      close: mockClose,
    })),
    auth: { basic: vi.fn() },
  },
}));

vi.mock('../../src/config/env.js', () => ({
  env: {
    cognodbUri: 'bolt://localhost:7687',
    cognodbUser: 'neo4j',
    cognodbPassword: 'password',
    isConfigured: true,
  },
}));

describe('driver.js', () => {
  let getDriver, runQuery, verifyConnectivity, closeDriver;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();

    vi.doMock('neo4j-driver', () => ({
      default: {
        driver: vi.fn(() => ({
          executeQuery: mockExecuteQuery,
          verifyConnectivity: mockVerifyConnectivity,
          close: mockClose,
        })),
        auth: { basic: vi.fn() },
      },
    }));

    vi.doMock('../../src/config/env.js', () => ({
      env: {
        cognodbUri: 'bolt://localhost:7687',
        cognodbUser: 'neo4j',
        cognodbPassword: 'password',
        isConfigured: true,
      },
    }));

    vi.doMock('../../src/utils/neo4jHelpers.js', () => ({
      recordsToPlain: vi.fn((r) => r),
    }));

    const driverMod = await import('../../src/db/driver.js');
    getDriver = driverMod.getDriver;
    runQuery = driverMod.runQuery;
    verifyConnectivity = driverMod.verifyConnectivity;
    closeDriver = driverMod.closeDriver;
  });

  it('getDriver returns a driver instance', () => {
    const d = getDriver();
    expect(d).toBeDefined();
    expect(d.executeQuery).toBeDefined();
  });

  it('runQuery returns plain records', async () => {
    mockExecuteQuery.mockResolvedValue({ records: [{ name: 'Alice' }] });
    const result = await runQuery('MATCH (n) RETURN n');
    expect(result).toEqual([{ name: 'Alice' }]);
  });

  it('runQuery throws AppError on ServiceUnavailable', async () => {
    const err = new Error('ServiceUnavailable');
    err.code = 'ServiceUnavailable';
    mockExecuteQuery.mockRejectedValue(err);

    try {
      await runQuery('MATCH (n) RETURN n');
      expect.fail('should have thrown');
    } catch (e) {
      expect(e.statusCode).toBe(503);
      expect(e.code).toBe('DB_UNAVAILABLE');
    }
  });

  it('runQuery throws AppError on ECONNREFUSED', async () => {
    const err = new Error('connect ECONNREFUSED');
    mockExecuteQuery.mockRejectedValue(err);

    try {
      await runQuery('MATCH (n) RETURN n');
      expect.fail('should have thrown');
    } catch (e) {
      expect(e.statusCode).toBe(503);
      expect(e.code).toBe('DB_UNAVAILABLE');
    }
  });

  it('verifyConnectivity returns status object', async () => {
    mockVerifyConnectivity.mockResolvedValue();
    const status = await verifyConnectivity();
    expect(status).toHaveProperty('up');
    expect(status).toHaveProperty('checkedAt');
    expect(status).toHaveProperty('message');
  });
});
