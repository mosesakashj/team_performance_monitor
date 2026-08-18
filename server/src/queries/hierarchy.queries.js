import { runQuery } from '../db/driver.js';

export async function getOrgHierarchy() {
  const rows = await runQuery(
    `
    MATCH (manager:Person)-[m:MANAGES]->(report:Person)
    RETURN manager.id AS managerId, manager.name AS managerName, manager.title AS managerTitle, manager.seniority AS managerSeniority,
           report.id AS reportId, report.name AS reportName, report.title AS reportTitle, report.seniority AS reportSeniority
    ORDER BY manager.name
    `
  );

  const byManager = new Map();
  for (const row of rows) {
    const managerId = row.managerId;
    if (!byManager.has(managerId)) {
      byManager.set(managerId, {
        person: { id: managerId, name: row.managerName, title: row.managerTitle, seniority: row.managerSeniority, isManager: true },
        reports: [],
      });
    }
    byManager.get(managerId).reports.push({
      id: row.reportId,
      name: row.reportName,
      title: row.reportTitle,
      seniority: row.reportSeniority,
    });
  }

  const allEmployees = await runQuery(
    `
    MATCH (p:Person)
    OPTIONAL MATCH (p)-[:MANAGES]->(direct)
    WITH p, count(direct) AS reportCount
    RETURN p.id AS id, p.name AS name, p.title AS title, p.seniority AS seniority, reportCount
    ORDER BY p.name
    `
  );

  const topLevel = [];
  for (const emp of allEmployees) {
    const isManaged = rows.some((row) => row.reportId === emp.id);
    if (!isManaged && emp.reportCount > 0) {
      topLevel.push({ id: emp.id, name: emp.name, title: emp.title, seniority: emp.seniority, reportCount: emp.reportCount });
    }
  }

  return { topLevel, byManager: Object.fromEntries(byManager), employees: allEmployees };
}

function groupEndorsementRows(rows) {
  const grouped = new Map();
  for (const row of rows) {
    const pid = row.endorseeId;
    if (!grouped.has(pid)) {
      grouped.set(pid, { id: pid, name: row.endorseeName, title: row.endorseeTitle, endorsements: [] });
    }
    grouped.get(pid).endorsements.push({
      endorser: { id: row.endorserId, name: row.endorserName, title: row.endorserTitle },
      date: row.date,
      note: row.note,
    });
  }
  return Array.from(grouped.values()).map((g) => ({
    endorsee: { id: g.id, name: g.name, title: g.title },
    endorsements: g.endorsements,
    endorsementCount: g.endorsements.length,
  }));
}

export async function getEndorsements(skillId) {
  if (skillId) {
    const rows = await runQuery(
      `
      MATCH (endorser:Person)-[e:ENDORSED]->(p:Person)-[:HAS_SKILL]->(s:Skill {id: $skillId})
      RETURN p.id AS endorseeId, p.name AS endorseeName, p.title AS endorseeTitle,
             endorser.id AS endorserId, endorser.name AS endorserName, endorser.title AS endorserTitle,
             e.date AS date, e.note AS note
      ORDER BY p.name
      `,
      { skillId }
    );
    return groupEndorsementRows(rows);
  }

  const rows = await runQuery(
    `
    MATCH (endorser:Person)-[e:ENDORSED]->(p:Person)
    RETURN p.id AS endorseeId, p.name AS endorseeName, p.title AS endorseeTitle,
           endorser.id AS endorserId, endorser.name AS endorserName, endorser.title AS endorserTitle,
           e.date AS date, e.note AS note
    ORDER BY p.name
    `
  );

  return groupEndorsementRows(rows).sort((a, b) => b.endorsementCount - a.endorsementCount);
}
