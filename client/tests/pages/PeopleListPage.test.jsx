import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import PeopleListPage from '../../src/pages/PeopleListPage.jsx';

vi.mock('../../src/hooks/usePeople.js', () => ({
  usePeopleList: () => ({ data: { people: [], total: 0 }, isLoading: false, isError: false, refetch: vi.fn() }),
}));
vi.mock('../../src/hooks/useSkills.js', () => ({
  useSkillsList: () => ({ data: { skills: [] }, isLoading: false }),
}));
vi.mock('../../src/hooks/useTeams.js', () => ({
  useTeamsList: () => ({ data: { teams: [] }, isLoading: false }),
}));
vi.mock('../../src/hooks/useDebouncedValue.js', () => ({
  useDebouncedValue: (val) => val,
}));
vi.mock('../../src/hooks/useUrlFilters.js', () => ({
  useUrlFilters: (defaults) => ({ filters: defaults, setFilter: vi.fn() }),
}));

describe('PeopleListPage', () => {
  it('renders heading', () => {
    render(
      <MemoryRouter>
        <PeopleListPage />
      </MemoryRouter>
    );
    expect(screen.getByText('People')).toBeTruthy();
  });
});
