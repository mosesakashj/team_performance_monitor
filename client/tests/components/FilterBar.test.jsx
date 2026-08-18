import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import FilterBar from '../../src/components/common/FilterBar.jsx';

describe('FilterBar', () => {
  it('renders children', () => {
    render(
      <FilterBar>
        <input placeholder="Search..." />
        <button>Filter 1</button>
        <button>Filter 2</button>
      </FilterBar>
    );
    expect(screen.getByPlaceholderText('Search...')).toBeTruthy();
    expect(screen.getByText('Filter 1')).toBeTruthy();
    expect(screen.getByText('Filter 2')).toBeTruthy();
  });
});
