import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockNode = class Node {
  constructor(labels, properties) {
    this.labels = labels;
    this.properties = properties;
  }
};

const mockRel = class Relationship {
  constructor(type, properties) {
    this.type = type;
    this.properties = properties;
  }
};

const mockPath = class Path {
  constructor(segments) {
    this.segments = segments;
  }
};

function makeInt(val, safe = true) {
  return {
    _neo4jInt: true,
    inSafeRange: () => safe,
    toNumber: () => val,
    toString: () => String(val),
  };
}

vi.mock('neo4j-driver', () => {
  const isInt = (v) => v && typeof v === 'object' && v._neo4jInt === true;
  const isDate = (v) => v && typeof v === 'object' && v._neo4jTemporalType === 'Date';
  const isDateTime = (v) => v && typeof v === 'object' && v._neo4jTemporalType === 'DateTime';
  const isLocalDateTime = (v) => v && typeof v === 'object' && v._neo4jTemporalType === 'LocalDateTime';
  const isTime = (v) => v && typeof v === 'object' && v._neo4jTemporalType === 'Time';
  const isLocalTime = (v) => v && typeof v === 'object' && v._neo4jTemporalType === 'LocalTime';
  const isDuration = (v) => v && typeof v === 'object' && v._neo4jTemporalType === 'Duration';

  return {
    default: {
      isInt,
      isDate,
      isDateTime,
      isLocalDateTime,
      isTime,
      isLocalTime,
      isDuration,
      types: { Node: mockNode, Relationship: mockRel, Path: mockPath },
    },
    isInt,
    isDate,
    isDateTime,
    isLocalDateTime,
    isTime,
    isLocalTime,
    isDuration,
    types: { Node: mockNode, Relationship: mockRel, Path: mockPath },
  };
});

let toPlain, recordsToPlain;

beforeEach(async () => {
  vi.clearAllMocks();
  const mod = await import('../../src/utils/neo4jHelpers.js');
  toPlain = mod.toPlain;
  recordsToPlain = mod.recordsToPlain;
});

describe('toPlain', () => {
  it('handles null', () => {
    expect(toPlain(null)).toBeNull();
  });

  it('handles undefined', () => {
    expect(toPlain(undefined)).toBeUndefined();
  });

  it('converts neo4j Integer in safe range', () => {
    const int = makeInt(42, true);
    expect(toPlain(int)).toBe(42);
  });

  it('converts neo4j Integer outside safe range', () => {
    const int = makeInt(9999999999999, false);
    expect(toPlain(int)).toBe('9999999999999');
  });

  it('converts arrays recursively', () => {
    const int = makeInt(5, true);
    expect(toPlain([int, 'hello'])).toEqual([5, 'hello']);
  });

  it('converts plain objects recursively', () => {
    const int = makeInt(3, true);
    expect(toPlain({ a: int, b: 'x' })).toEqual({ a: 3, b: 'x' });
  });

  it('converts neo4j temporal types', () => {
    const temporal = { _neo4jTemporalType: 'Date', toString: () => '2024-01-01' };
    expect(toPlain(temporal)).toBe('2024-01-01');
  });

  it('converts neo4j Node to properties + _labels', () => {
    const node = new mockNode(['Person'], { name: 'Alice' });
    const result = toPlain(node);
    expect(result).toEqual({ name: 'Alice', _labels: ['Person'] });
  });

  it('converts neo4j Relationship to properties + _type', () => {
    const rel = new mockRel('WORKS_AT', { since: 2020 });
    const result = toPlain(rel);
    expect(result).toEqual({ since: 2020, _type: 'WORKS_AT' });
  });

  it('converts neo4j Path to segments array', () => {
    const startNode = new mockNode(['Person'], { id: '1' });
    const endNode = new mockNode(['Person'], { id: '2' });
    const rel = new mockRel('KNOWS', {});
    const path = new mockPath([{ start: startNode, relationship: rel, end: endNode }]);
    const result = toPlain(path);
    expect(result).toEqual({
      segments: [
        {
          start: { id: '1', _labels: ['Person'] },
          relationship: { _type: 'KNOWS' },
          end: { id: '2', _labels: ['Person'] },
        },
      ],
    });
  });
});

describe('recordsToPlain', () => {
  it('maps over records', () => {
    const record1 = { toObject: () => ({ name: 'Alice' }) };
    const record2 = { toObject: () => ({ name: 'Bob' }) };
    const result = recordsToPlain([record1, record2]);
    expect(result).toEqual([{ name: 'Alice' }, { name: 'Bob' }]);
  });
});
