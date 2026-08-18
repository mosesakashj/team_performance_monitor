import { describe, it, expect } from 'vitest';
import { listPeopleSchema } from '../../src/validators/people.validator.js';
import { listProjectsSchema } from '../../src/validators/projects.validator.js';
import { listSkillsSchema } from '../../src/validators/skills.validator.js';
import { teamIdSchema } from '../../src/validators/teams.validator.js';
import { searchSchema } from '../../src/validators/search.validator.js';
import { endorsementsSchema } from '../../src/validators/hierarchy.validator.js';
import { skillGapsSchema, bottlenecksSchema, teamCompositionSchema, personTimelineSchema } from '../../src/validators/analytics.validator.js';
import { dashboardBottlenecksSchema } from '../../src/validators/dashboard.validator.js';
import { skillRecsSchema, projectRecsSchema, teamCompatibilitySchema } from '../../src/validators/recommendations.validator.js';

describe('validators', () => {
  describe('people', () => {
    it('listPeopleSchema parses valid input', () => {
      const result = listPeopleSchema.safeParse({ search: 'alice', skillId: 's1', teamId: 't1', availableOnly: 'true', limit: '10', offset: '0' });
      expect(result.success).toBe(true);
    });

    it('coerces limit/offset to numbers', () => {
      const result = listPeopleSchema.safeParse({ limit: '25', offset: '5' });
      expect(result.success).toBe(true);
      expect(result.data.limit).toBe(25);
      expect(result.data.offset).toBe(5);
    });
  });

  describe('projects', () => {
    it('listProjectsSchema parses valid input', () => {
      const result = listProjectsSchema.safeParse({ status: 'active', teamId: 't1', limit: '10', offset: '0' });
      expect(result.success).toBe(true);
    });

    it('rejects invalid status', () => {
      const result = listProjectsSchema.safeParse({ status: 'invalid' });
      expect(result.success).toBe(false);
    });
  });

  describe('skills', () => {
    it('listSkillsSchema parses valid input', () => {
      const result = listSkillsSchema.safeParse({ category: 'frontend' });
      expect(result.success).toBe(true);
    });

    it('allows empty input', () => {
      const result = listSkillsSchema.safeParse({});
      expect(result.success).toBe(true);
    });
  });

  describe('teams', () => {
    it('teamIdSchema parses valid input', () => {
      const result = teamIdSchema.safeParse({ id: 'team-1' });
      expect(result.success).toBe(true);
    });

    it('rejects empty id', () => {
      const result = teamIdSchema.safeParse({ id: '' });
      expect(result.success).toBe(false);
    });
  });

  describe('search', () => {
    it('searchSchema requires min 2 chars', () => {
      expect(searchSchema.safeParse({ q: 'ab' }).success).toBe(true);
      expect(searchSchema.safeParse({ q: 'a' }).success).toBe(false);
    });
  });

  describe('hierarchy', () => {
    it('endorsementsSchema parses optional skillId', () => {
      expect(endorsementsSchema.safeParse({}).success).toBe(true);
      expect(endorsementsSchema.safeParse({ skillId: 's1' }).success).toBe(true);
    });
  });

  describe('analytics', () => {
    it('skillGapsSchema parses valid input', () => {
      expect(skillGapsSchema.safeParse({ id: 'p1' }).success).toBe(true);
    });

    it('bottlenecksSchema parses valid input', () => {
      expect(bottlenecksSchema.safeParse({ limit: '10' }).success).toBe(true);
      expect(bottlenecksSchema.safeParse({}).success).toBe(true);
    });

    it('teamCompositionSchema parses valid input', () => {
      expect(teamCompositionSchema.safeParse({ id: 't1' }).success).toBe(true);
    });

    it('personTimelineSchema parses valid input', () => {
      expect(personTimelineSchema.safeParse({ id: 'person1' }).success).toBe(true);
    });
  });

  describe('dashboard', () => {
    it('dashboardBottlenecksSchema parses valid input', () => {
      expect(dashboardBottlenecksSchema.safeParse({ limit: '5' }).success).toBe(true);
      expect(dashboardBottlenecksSchema.safeParse({}).success).toBe(true);
    });
  });

  describe('recommendations', () => {
    it('skillRecsSchema parses valid input', () => {
      expect(skillRecsSchema.safeParse({ id: 'p1', limit: '5' }).success).toBe(true);
    });

    it('projectRecsSchema parses valid input', () => {
      expect(projectRecsSchema.safeParse({ id: 'p1', limit: '3' }).success).toBe(true);
    });

    it('teamCompatibilitySchema validates personIds array', () => {
      expect(teamCompatibilitySchema.safeParse({ personIds: ['a', 'b'] }).success).toBe(true);
      expect(teamCompatibilitySchema.safeParse({ personIds: ['a'] }).success).toBe(false);
      expect(teamCompatibilitySchema.safeParse({ personIds: [] }).success).toBe(false);
      expect(teamCompatibilitySchema.safeParse({}).success).toBe(false);
    });
  });
});
