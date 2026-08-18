import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Pagination from '../../src/components/common/Pagination.jsx';

describe('Pagination', () => {
  it('renders correct page numbers', () => {
    render(<Pagination offset={0} limit={10} total={50} onChange={vi.fn()} />);
    const buttons = screen.getAllByRole('button');
    const pageButtons = buttons.filter((b) => /^\d+$/.test(b.textContent));
    expect(pageButtons.length).toBeGreaterThanOrEqual(5);
    expect(pageButtons.some((b) => b.textContent === '1')).toBe(true);
    expect(pageButtons.some((b) => b.textContent === '5')).toBe(true);
  });

  it('shows "Showing X-Y of Z" text', () => {
    render(<Pagination offset={0} limit={10} total={50} onChange={vi.fn()} />);
    const showingText = screen.getByText(/Showing/);
    expect(showingText).toBeInTheDocument();
    expect(showingText.textContent).toMatch(/Showing/);
    expect(screen.getAllByText('50').length).toBeGreaterThanOrEqual(1);
  });

  it('disables prev button on first page', () => {
    render(<Pagination offset={0} limit={10} total={50} onChange={vi.fn()} />);
    const prevBtn = screen.getByText('Prev');
    expect(prevBtn).toBeDisabled();
  });

  it('disables next button on last page', () => {
    render(<Pagination offset={40} limit={10} total={50} onChange={vi.fn()} />);
    const nextBtn = screen.getByText('Next');
    expect(nextBtn).toBeDisabled();
  });

  it('calls onChange with correct offset when clicking page', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Pagination offset={0} limit={10} total={50} onChange={onChange} />);
    await user.click(screen.getByText('2'));
    expect(onChange).toHaveBeenCalledWith(10);
  });
});
