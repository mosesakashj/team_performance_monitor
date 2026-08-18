import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ErrorBoundary from '../../src/components/common/ErrorBoundary.jsx';

describe('ErrorBoundary', () => {
  it('renders children when no error', () => {
    render(
      <ErrorBoundary>
        <div>Child content</div>
      </ErrorBoundary>
    );
    expect(screen.getByText('Child content')).toBeTruthy();
  });

  it('renders error UI when child throws', () => {
    const ThrowingChild = () => {
      throw new Error('Test error');
    };
    render(
      <ErrorBoundary>
        <ThrowingChild />
      </ErrorBoundary>
    );
    expect(screen.getByText(/something went wrong/i)).toBeTruthy();
  });
});
