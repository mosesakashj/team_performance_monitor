import { runQuery } from '../db/driver.js';

export async function getOrgHierarchy() {
  const rows = await runQuery(
    `
    MATCH (manager:Person)-[m:MANAGES]->(report:Person)
    WITH manager, collect(report { .id, .name, .title, .seniority }) AS reports
    RETURN manager { .*, reports: reports } AS managerData, reports
    ORDER BY manager.name
    `
  );

  const byManager = new Map();
  for (const row of rows) {
    byManager.set(row.managerData.id, {
      person: { ...row.managerData, isManager: true },
      reports: row.reports,
    });
  }

  const allEmployees = await runQuery(
    `
    MATCH (p:Person)
    OPTIONAL MATCH (p)-[:MANAGES]->(direct)
    WITH p, count(direct) AS reportCount
    RETURN p { .*, reportCount: reportCount } AS person
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
      WITH p, collect(DISTINCT {endorserId: endorser.id, endorserName: endorser.name, endorserTitle: endorser.title, date: e.date, note: e.note}) AS endorsements
      RETURN p { .*, skills: [], teams: [], projects: [] } AS endorsee, endorsements, size(endorsements) AS endorsementCount
      ORDER BY p.name
      `,
      { skillId }
    );
    return rows.map((r) => ({
      endorsee: r.endorsee,
      endorsements: r.endorsements.map((e) => ({
        endorser: { id: e.endorserId, name: e.endorserName, title: e.endorserTitle },
        date: e.date,
        note: e.note,
      })),
      endorsementCount: r.endorsementCount,
    }));
  }

  const rows = await runQuery(
    `
    MATCH (endorser:Person)-[e:ENDORSED]->(p:Person)
    WITH p, collect(DISTINCT {endorserId: endorser.id, endorserName: endorser.name, endorserTitle: endorser.title, date: e.date, note: e.note}) AS endorsements
    RETURN p { .*, skills: [], teams: [], projects: [] } AS endorsee, endorsements, size(endorsements) AS endorsementCount
    ORDER BY endorsementCount DESC, p.name
    `
  );
  return rows.map((r) => ({
    endorsee: r.endorsee,
    endorsements: r.endorsements.map((e) => ({
      endorser: { id: e.endorserId, name: e.endorserName, title: e.endorserTitle },
      date: e.date,
      note: e.note,
    })),
    endorsementCount: r.endorsementCount,
  }));
}
