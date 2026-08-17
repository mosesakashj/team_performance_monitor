import neo4j from 'neo4j-driver';

/**
 * Recursively converts Neo4j driver types (Integer, temporal types, Node, Relationship,
 * Path) into plain JSON-serializable values so route handlers can `res.json()` results
 * directly without every caller re-implementing this conversion.
 */
export function toPlain(value) {
  if (value === null || value === undefined) return value;

  if (neo4j.isInt(value)) {
    return value.inSafeRange() ? value.toNumber() : value.toString();
  }

  if (
    neo4j.isDate(value) ||
    neo4j.isDateTime(value) ||
    neo4j.isLocalDateTime(value) ||
    neo4j.isTime(value) ||
    neo4j.isLocalTime(value) ||
    neo4j.isDuration(value)
  ) {
    return value.toString();
  }

  if (Array.isArray(value)) {
    return value.map(toPlain);
  }

  if (value instanceof neo4j.types.Node) {
    return { ...toPlain(value.properties), _labels: value.labels };
  }

  if (value instanceof neo4j.types.Relationship) {
    return { ...toPlain(value.properties), _type: value.type };
  }

  if (value instanceof neo4j.types.Path) {
    return {
      segments: value.segments.map((segment) => ({
        start: toPlain(segment.start),
        relationship: toPlain(segment.relationship),
        end: toPlain(segment.end),
      })),
    };
  }

  if (typeof value === 'object') {
    const result = {};
    for (const [key, val] of Object.entries(value)) {
      result[key] = toPlain(val);
    }
    return result;
  }

  return value;
}

/** Converts every record in a driver result summary into a plain object. */
export function recordsToPlain(records) {
  return records.map((record) => toPlain(record.toObject()));
}
