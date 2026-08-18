import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import {
  SkeletonTile,
  SkeletonCard,
  SkeletonList,
  SkeletonGrid,
} from '../../src/components/common/Skeleton.jsx';

describe('SkeletonTile', () => {
  it('renders without crashing', () => {
    render(<SkeletonTile />);
  });
});

describe('SkeletonCard', () => {
  it('renders without crashing', () => {
    render(<SkeletonCard />);
  });
});

describe('SkeletonList', () => {
  it('renders correct number of rows', () => {
    const { container } = render(<SkeletonList rows={3} />);
    const rows = container.querySelectorAll('.flex.items-center.justify-between');
    expect(rows.length).toBe(3);
  });
});

describe('SkeletonGrid', () => {
  it('renders correct number of items', () => {
    const { container } = render(<SkeletonGrid count={4} cols={2} />);
    const cards = container.querySelectorAll('.card-base');
    expect(cards.length).toBe(4);
  });

  it('applies correct grid columns', () => {
    const { container } = render(<SkeletonGrid count={3} cols={4} />);
    const grid = container.firstChild;
    expect(grid.className).toContain('lg:grid-cols-4');
  });
});
