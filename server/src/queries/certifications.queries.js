import { runQuery } from '../db/driver.js';

/**
 * List all certifications with holder count.
 */
export async function listCertifications() {
  return runQuery(
    `
    MATCH (c:Certification)
    OPTIONAL MATCH (p:Person)-[:HAS_CERTIFICATION]->(c)
    WITH c, count(DISTINCT p) AS holderCount
    RETURN c { .id, .name, .provider, .category, .validity_months, holderCount } AS certification
    ORDER BY c.category, c.name
    `
  );
}

/**
 * Get certification detail with holders.
 */
export async function getCertificationById(certificationId) {
  const rows = await runQuery(
    `
    MATCH (c:Certification {id: $certificationId})
    OPTIONAL MATCH (p:Person)-[hc:HAS_CERTIFICATION]->(c)
    WITH c, collect(DISTINCT {
      personId: p.id, name: p.name, title: p.title,
      issued_by: hc.issued_by, issue_date: hc.issue_date, expiry_date: hc.expiry_date
    }) AS holders
    RETURN c { .id, .name, .provider, .category, .validity_months } AS certification, holders
    `,
    { certificationId }
  );
  return rows[0] ?? null;
}

/**
 * Get certifications expiring soon (within 90 days).
 */
export async function getExpiringCertifications({ days = 90 } = {}) {
  return runQuery(
    `
    MATCH (p:Person)-[hc:HAS_CERTIFICATION]->(c:Certification)
    WHERE hc.expiry_date IS NOT NULL
      AND date(hc.expiry_date) <= date() + duration({days: $days})
      AND date(hc.expiry_date) >= date()
    RETURN p { .id, .name, .title } AS person,
           c { .id, .name, .provider } AS certification,
           hc.expiry_date AS expiryDate
    ORDER BY hc.expiry_date ASC
    `,
    { days }
  );
}
