import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import DashboardPage from '../../src/pages/DashboardPage.jsx';

vi.mock('../../src/hooks/useStats.js', () => ({
  useStats: () => ({ data: { peopleCount: 100, activeProjectCount: 5, availableCount: 80, teamCount: 10, skillCount: 50, projectCount: 20 }, isLoading: false, isError: false, refetch: vi.fn() }),
}));
vi.mock('../../src/hooks/useProjects.js', () => ({
  useProjectsList: () => ({ data: { projects: [] }, isLoading: false, isError: false, refetch: vi.fn() }),
}));
vi.mock('../../src/hooks/useTeams.js', () => ({
  useTeamsList: () => ({ data: { teams: [] }, isLoading: false }),
}));
vi.mock('../../src/hooks/useSkills.js', () => ({
  useSkillsList: () => ({ data: { skills: [] }, isLoading: false }),
}));
vi.mock('../../src/hooks/useDashboardData.js', () => ({
  useEnrichedStats: () => ({ data: { avgUtilization: 75, totalEndorsements: 50, completedProjectCount: 10 } }),
  useSkillDistribution: () => ({ data: { distribution: [] } }),
  useTopBottlenecks: () => ({ data: { bottlenecks: [] } }),
  useGlobalSkillGaps: () => ({ data: { gaps: [] } }),
  useActivityFeed: () => ({ data: { feed: [] } }),
}));

describe('DashboardPage', () => {
  it('renders heading', () => {
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );
    expect(screen.getByText('Staffing overview')).toBeTruthy();
  });

  it('renders stat tiles', () => {
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );
    expect(screen.getByText('People')).toBeTruthy();
    expect(screen.getAllByText('Active projects').length).toBeGreaterThanOrEqual(1);
  });
});
