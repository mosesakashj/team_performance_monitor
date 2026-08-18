import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatusBadge from '../../src/components/common/StatusBadge.jsx';

describe('StatusBadge', () => {
  it('renders correct text and color for active status', () => {
    render(<StatusBadge status="active" />);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('renders correct text and color for proposed status', () => {
    render(<StatusBadge status="proposed" />);
    expect(screen.getByText('Proposed')).toBeInTheDocument();
  });

  it('renders correct text and color for on_hold status', () => {
    render(<StatusBadge status="on_hold" />);
    expect(screen.getByText('On Hold')).toBeInTheDocument();
  });
});
