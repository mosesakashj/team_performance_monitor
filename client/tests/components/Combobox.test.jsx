import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Combobox from '../../src/components/common/Combobox.jsx';

describe('Combobox', () => {
  it('renders with label', () => {
    render(<Combobox label="Pick a person" results={[]} onSearch={() => {}} onChange={() => {}} />);
    expect(screen.getByText('Pick a person')).toBeTruthy();
  });

  it('renders placeholder', () => {
    render(<Combobox placeholder="Search..." results={[]} onSearch={() => {}} onChange={() => {}} />);
    expect(screen.getByPlaceholderText('Search...')).toBeTruthy();
  });

  it('calls onSearch when typing', async () => {
    const onSearch = vi.fn();
    render(<Combobox results={[]} onSearch={onSearch} onChange={() => {}} />);
    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'test' } });
    expect(onSearch).toHaveBeenCalled();
  });

  it('shows selected value', () => {
    render(<Combobox value={{ label: 'John Doe' }} results={[]} onSearch={() => {}} onChange={() => {}} />);
    expect(screen.getByText('John Doe')).toBeTruthy();
  });

  it('calls onChange(null) when clear button clicked', () => {
    const onChange = vi.fn();
    render(<Combobox value={{ label: 'John Doe' }} results={[]} onSearch={() => {}} onChange={onChange} />);
    const clearBtn = screen.getByRole('button');
    fireEvent.click(clearBtn);
    expect(onChange).toHaveBeenCalledWith(null);
  });
});
