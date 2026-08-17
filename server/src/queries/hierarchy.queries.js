import { runQuery } from '../db/driver.js';

export async function getOrgHierarchy() {
  const rows = await runQuery(
    `
    MATCH (manager:Person)-[m:MANAGES]->(report:Person)
    RETURN
      manager { .*, reports: [] } AS manager,
      collect(report { .*, relationshipId: elementId(m) }) AS reports
    ORDER BY manager.name
    `
  );

  const byManager = new Map();
  for (const row of rows) {
    byManager.set(row.manager.id, {
      person: { ...row.manager, isManager: true },
      reports: row.reports,
    });
  }

  const allEmployees = await runQuery(
    `
    MATCH (p:Person)
    OPTIONAL MATCH (p)-[:MANAGES]->(direct)
    RETURN p { .*, reportCount: count(direct) } AS person
    ORDER BY p.name
    `
  );

  const topLevel = [];
  const employees = allEmployees.map((r) => r.person);

  for (const emp of employees) {
    const isManaged = rows.some((row) =>
      row.reports.some((r) => r.id === emp.id)
    );
    if (!isManaged && emp.reportCount > 0) {
      topLevel.push(emp);
    }
  }

  return { topLevel, byManager: Object.fromEntries(byManager), employees };
}

export async function getEndorsements(skillId) {
  if (skillId) {
    const rows = await runQuery(
      `
      MATCH (endorser:Person)-[e:ENDORSED]->(p:Person)-[:HAS_SKILL]->(s:Skill {id: $skillId})
      RETURN
        p { .*, skills: [], teams: [], projects: [] } AS endorsee,
        collect(DISTINCT {endorser: endorser { .* }, date: e.date, note: e.note}) AS endorsements
      ORDER BY p.name
      `,
      { skillId }
    );
    return rows.map((r) => ({
      endorsee: r.endorsee,
      endorsements: r.endorsements,
      endorsementCount: r.endorsements.length,
    }));
  }

  const rows = await runQuery(
    `
    MATCH (endorser:Person)-[e:ENDORSED]->(p:Person)
    RETURN
      p { .*, skills: [], teams: [], projects: [] } AS endorsee,
      collect(DISTINCT {endorser: endorser { .* }, date: e.date, note: e.note}) AS endorsements
    ORDER BY endorsements.size() DESC, p.name
    `
  );
  return rows.map((r) => ({
    endorsee: r.endorsee,
    endorsements: r.endorsements,
    endorsementCount: r.endorsements.length,
  }));
}
