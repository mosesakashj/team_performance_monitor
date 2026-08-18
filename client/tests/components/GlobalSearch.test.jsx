import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import GlobalSearch from '../../src/components/layout/GlobalSearch.jsx';

vi.mock('../../src/hooks/useSearch.js', () => ({
  useSearch: () => ({ data: { results: [] }, isFetching: false }),
}));

describe('GlobalSearch', () => {
  it('renders search input', () => {
    render(
      <MemoryRouter>
        <GlobalSearch />
      </MemoryRouter>
    );
    expect(screen.getByPlaceholderText('Search people, projects, skills...')).toBeTruthy();
    expect(screen.getByRole('combobox')).toBeTruthy();
  });
});
