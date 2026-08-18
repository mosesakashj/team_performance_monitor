import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import LoadingSpinner from '../../src/components/common/LoadingSpinner.jsx';

describe('LoadingSpinner', () => {
  it('renders spinner', () => {
    const { container } = render(<LoadingSpinner />);
    expect(container.querySelector('div')).toBeTruthy();
  });

  it('renders with label', () => {
    render(<LoadingSpinner label="Loading data..." />);
    expect(screen.getByText('Loading data...')).toBeTruthy();
  });
});
