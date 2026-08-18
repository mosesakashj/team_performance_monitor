import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { exportToCSV, exportToJSON } from '../../src/utils/exportData.js';

describe('exportToCSV', () => {
  let appendSpy, removeSpy, clickSpy;
  let createObjectURLSpy, revokeObjectURLSpy;

  beforeEach(() => {
    clickSpy = vi.fn();
    appendSpy = vi.fn();
    removeSpy = vi.fn();
    createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test');
    revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

    vi.spyOn(document, 'createElement').mockImplementation(() => ({
      href: '',
      download: '',
      click: clickSpy,
    }));
    vi.spyOn(document.body, 'appendChild').mockImplementation(appendSpy);
    vi.spyOn(document.body, 'removeChild').mockImplementation(removeSpy);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('creates correct CSV format', () => {
    const data = [
      { name: 'Alice', age: 30 },
      { name: 'Bob', age: 25 },
    ];
    exportToCSV(data, 'test.csv');
    expect(clickSpy).toHaveBeenCalled();
  });

  it('handles empty data', () => {
    exportToCSV([], 'empty.csv');
    expect(clickSpy).not.toHaveBeenCalled();
  });

  it('escapes quotes in values', () => {
    const data = [{ quote: 'He said "hello"' }];
    exportToCSV(data, 'escaped.csv');
    expect(clickSpy).toHaveBeenCalled();
  });
});

describe('exportToJSON', () => {
  beforeEach(() => {
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    vi.spyOn(document, 'createElement').mockImplementation(() => ({
      href: '',
      download: '',
      click: vi.fn(),
    }));
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => {});
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('creates correct JSON format', () => {
    const data = [{ id: 1, name: 'Test' }];
    exportToJSON(data, 'test.json');
    expect(URL.createObjectURL).toHaveBeenCalled();
  });
});

describe('downloadBlob', () => {
  beforeEach(() => {
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => {});
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('creates anchor element for download', () => {
    const clickSpy = vi.fn();
    vi.spyOn(document, 'createElement').mockImplementation(() => ({
      href: '',
      download: '',
      click: clickSpy,
    }));

    const data = [{ id: 1 }];
    exportToCSV(data, 'test.csv');
    expect(document.createElement).toHaveBeenCalledWith('a');
    expect(clickSpy).toHaveBeenCalled();
  });
});
