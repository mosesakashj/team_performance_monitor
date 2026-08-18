import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import HealthBanner from '../../src/components/layout/HealthBanner.jsx';

vi.mock('../../src/hooks/useHealth.js', () => ({
  useHealth: () => ({ data: { up: true, latencyMs: 50 }, isLoading: false, isError: false }),
}));

describe('HealthBanner', () => {
  it('renders nothing when healthy', () => {
    const { container } = render(<HealthBanner />);
    expect(container.innerHTML).toBe('');
  });
});
