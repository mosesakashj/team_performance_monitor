import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ViewToggle from '../../src/components/common/ViewToggle.jsx';

describe('ViewToggle', () => {
  it('renders both view options', () => {
    render(<ViewToggle view="card" onChange={() => {}} />);
    expect(screen.getByText('Grid')).toBeTruthy();
    expect(screen.getByText('Table')).toBeTruthy();
  });

  it('calls onChange when toggling', () => {
    const onChange = vi.fn();
    render(<ViewToggle view="card" onChange={onChange} />);
    fireEvent.click(screen.getByText('Table'));
    expect(onChange).toHaveBeenCalledWith('table');
  });
});
