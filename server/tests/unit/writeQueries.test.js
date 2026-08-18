import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as writeQueries from '../../src/queries/write.queries.js';

vi.mock('../../src/db/driver.js', () => ({
  runQuery: vi.fn().mockResolvedValue([]),
}));

vi.mock('../../src/middleware/cache.js', () => ({
  clearCache: vi.fn(),
}));

describe('write.queries.js', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('updatePerson', () => {
    it('filters to allowed fields only', async () => {
      const { runQuery } = await import('../../src/db/driver.js');
      runQuery.mockResolvedValue([{ p: { id: 'p1' } }]);

      await writeQueries.updatePerson('p1', { name: 'Alice', malicious: 'hack', title: 'Engineer' });

      const call = runQuery.mock.calls[0];
      const cypher = call[0];
      expect(cypher).toContain('p.name = $name');
      expect(cypher).toContain('p.title = $title');
      expect(cypher).not.toContain('malicious');
    });

    it('returns null when no valid fields', async () => {
      const result = await writeQueries.updatePerson('p1', { invalidField: 'value' });
      expect(result).toBeNull();
    });
  });

  describe('updateProject', () => {
    it('filters to allowed fields only', async () => {
      const { runQuery } = await import('../../src/db/driver.js');
      runQuery.mockResolvedValue([{ p: { id: 'proj1' } }]);

      await writeQueries.updateProject('proj1', { name: 'New Name', status: 'active', evil: 'drop' });

      const call = runQuery.mock.calls[0];
      const cypher = call[0];
      expect(cypher).toContain('p.name = $name');
      expect(cypher).toContain('p.status = $status');
      expect(cypher).not.toContain('evil');
    });
  });

  describe('updateSkill', () => {
    it('filters to allowed fields only', async () => {
      const { runQuery } = await import('../../src/db/driver.js');
      runQuery.mockResolvedValue([{ s: { id: 's1' } }]);

      await writeQueries.updateSkill('s1', { name: 'React', category: 'Framework', injection: 'x' });

      const call = runQuery.mock.calls[0];
      const cypher = call[0];
      expect(cypher).toContain('s.name = $name');
      expect(cypher).toContain('s.category = $category');
      expect(cypher).not.toContain('injection');
    });
  });

  describe('updateTeam', () => {
    it('filters to allowed fields only', async () => {
      const { runQuery } = await import('../../src/db/driver.js');
      runQuery.mockResolvedValue([{ t: { id: 't1' } }]);

      await writeQueries.updateTeam('t1', { name: 'New Team', department: 'Eng', bad: 'field' });

      const call = runQuery.mock.calls[0];
      const cypher = call[0];
      expect(cypher).toContain('t.name = $name');
      expect(cypher).toContain('t.department = $department');
      expect(cypher).not.toContain('bad');
    });
  });
});
