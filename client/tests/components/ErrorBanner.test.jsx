import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ErrorBanner from '../../src/components/common/ErrorBanner.jsx';

describe('ErrorBanner', () => {
  it('renders error message', () => {
    render(<ErrorBanner message="Something broke!" />);
    expect(screen.getByText('Something broke!')).toBeInTheDocument();
  });

  it('calls onRetry when retry button clicked', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(<ErrorBanner message="Error" onRetry={onRetry} />);
    await user.click(screen.getByText('Try again'));
    expect(onRetry).toHaveBeenCalled();
  });
});
