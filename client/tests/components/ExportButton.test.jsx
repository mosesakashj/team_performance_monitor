import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ExportButton } from '../../src/components/common/ExportButton.jsx';

vi.mock('../../src/utils/exportData.js', () => ({
  exportToCSV: vi.fn(),
  exportToJSON: vi.fn(),
}));

describe('ExportButton', () => {
  it('renders export button', () => {
    render(<ExportButton data={[{ name: 'test' }]} filename="test" />);
    expect(screen.getByText('Export')).toBeTruthy();
  });

  it('shows dropdown on click', async () => {
    render(<ExportButton data={[{ name: 'test' }]} filename="test" />);
    fireEvent.click(screen.getByText('Export'));
    expect(screen.getByText('Export as CSV')).toBeTruthy();
    expect(screen.getByText('Export as JSON')).toBeTruthy();
  });
});
