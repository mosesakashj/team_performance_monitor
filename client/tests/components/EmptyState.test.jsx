import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import EmptyState from '../../src/components/common/EmptyState.jsx';

describe('EmptyState', () => {
  it('renders title and description', () => {
    render(<EmptyState title="No data" description="There is nothing to show." />);
    expect(screen.getByText('No data')).toBeInTheDocument();
    expect(screen.getByText('There is nothing to show.')).toBeInTheDocument();
  });

  it('renders icon when provided', () => {
    render(
      <EmptyState
        title="Empty"
        description="Nothing here"
        icon={<span data-testid="icon">🔍</span>}
      />
    );
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });
});
