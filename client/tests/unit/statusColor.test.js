import { describe, it, expect } from 'vitest';
import { statusColor } from '../../src/utils/statusColor.js';

describe('statusColor', () => {
  it("returns 'green' for 'active'", () => {
    expect(statusColor('active')).toBe('green');
  });

  it("returns 'brand' for 'proposed'", () => {
    expect(statusColor('proposed')).toBe('brand');
  });

  it("returns 'amber' for 'on_hold'", () => {
    expect(statusColor('on_hold')).toBe('amber');
  });

  it("returns 'slate' for 'completed'", () => {
    expect(statusColor('completed')).toBe('slate');
  });

  it("returns 'slate' for unknown status", () => {
    expect(statusColor('unknown')).toBe('slate');
    expect(statusColor('')).toBe('slate');
    expect(statusColor(null)).toBe('slate');
    expect(statusColor(undefined)).toBe('slate');
  });
});
