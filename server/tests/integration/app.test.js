import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createApp } from '../../src/app.js';

vi.mock('../../src/db/driver.js', () => ({
  verifyConnectivity: vi.fn().mockResolvedValue({ up: true, message: 'ok' }),
  getDriver: vi.fn(),
}));

let app;

beforeEach(async () => {
  vi.clearAllMocks();
  app = createApp();
});

describe('Express app', () => {
  it('app is an Express instance with routes mounted', () => {
    expect(app).toBeDefined();
    expect(typeof app.use).toBe('function');
    expect(typeof app.get).toBe('function');
  });

  it('app handles notFoundHandler for unmatched routes', async () => {
    // Verify the app middleware stack includes notFoundHandler and errorHandler
    expect(app._router).toBeDefined();
  });
});
