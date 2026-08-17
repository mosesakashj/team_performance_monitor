import 'dotenv/config';
import neo4j from 'neo4j-driver';
import { faker } from '@faker-js/faker';
import { skills } from './seed-data/skills.js';
import { relatedSkills } from './seed-data/relatedSkills.js';

// Fixed seed makes generation deterministic, so re-running this script against
// the same database (with MERGE-based loading below) is idempotent.
faker.seed(1234);

const RESET = process.argv.includes('--reset');

const uri = process.env.COGNODB_URI;
const user = process.env.COGNODB_USER;
const password = process.env.COGNODB_PASSWORD;

if (!uri || !user || !password) {
  console.error('[seed] Missing COGNODB_URI / COGNODB_USER / COGNODB_PASSWORD. Copy server/.env.example to server/.env first.');
  process.exit(1);
}

const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));

const PEOPLE_COUNT = 180;
const PROJECT_COUNT = 40;
const TEAM_NAMES = [
  ['Platform Engineering', 'Engineering'],
  ['Data & Analytics', 'Engineering'],
  ['Fintech Delivery', 'Consulting'],
  ['Mobile', 'Engineering'],
  ['DevOps & SRE', 'Engineering'],
  ['AI/ML', 'Engineering'],
  ['QA & Reliability', 'Engineering'],
  ['Design Systems', 'Design'],
  ['Growth Engineering', 'Engineering'],
  ['Security', 'Engineering'],
];

const SENIORITIES = ['junior', 'mid', 'senior', 'staff', 'principal'];
const SENIORITY_WEIGHTS = [0.25, 0.35, 0.25, 0.1, 0.05];
const TITLES_BY_SENIORITY = {
  junior: ['Junior Engineer', 'Associate Consultant', 'Junior Analyst'],
  mid: ['Software Engineer', 'Consultant', 'Data Analyst', 'Product Designer'],
  senior: ['Senior Engineer', 'Senior Consultant', 'Senior Data Scientist', 'Engineering Lead'],
  staff: ['Staff Engineer', 'Principal Consultant', 'Engineering Manager'],
  principal: ['Principal Engineer', 'Director of Engineering', 'VP of Delivery'],
};

const PROJECT_STATUSES = ['proposed', 'active', 'completed', 'on_hold'];
const PROJECT_STATUS_WEIGHTS = [0.15, 0.45, 0.3, 0.1];

function weightedPick(items, weights) {
  const r = faker.number.float({ min: 0, max: 1 });
  let acc = 0;
  for (let i = 0; i < items.length; i++) {
    acc += weights[i];
    if (r <= acc) return items[i];
  }
  return items[items.length - 1];
}

function pickN(array, n) {
  return faker.helpers.arrayElements(array, Math.min(n, array.length));
}

function isoDate(date) {
  return date.toISOString().slice(0, 10);
}

// ---------- Generate nodes ----------

const teams = TEAM_NAMES.map(([name, department], i) => ({
  id: `team-${i + 1}`,
  name,
  department,
}));

const people = Array.from({ length: PEOPLE_COUNT }, (_, i) => {
  const seniority = weightedPick(SENIORITIES, SENIORITY_WEIGHTS);
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const utilization = faker.number.int({ min: 20, max: 115 });
  return {
    id: `person-${i + 1}`,
    name: `${firstName} ${lastName}`,
    email: faker.internet.email({ firstName, lastName }).toLowerCase(),
    title: faker.helpers.arrayElement(TITLES_BY_SENIORITY[seniority]),
    seniority,
    location: `${faker.location.city()}, ${faker.location.country()}`,
    timezone: faker.helpers.arrayElement(['UTC-8', 'UTC-5', 'UTC+0', 'UTC+1', 'UTC+5:30', 'UTC+8']),
    weekly_capacity_hours: 40,
    current_utilization_pct: utilization,
    available_from: isoDate(utilization >= 100 ? faker.date.soon({ days: 45 }) : faker.date.recent({ days: 5 })),
    hourly_cost: faker.number.int({ min: 60, max: 240 }),
  };
});

const projects = Array.from({ length: PROJECT_COUNT }, (_, i) => {
  const status = weightedPick(PROJECT_STATUSES, PROJECT_STATUS_WEIGHTS);
  const start = faker.date.past({ years: 2 });
  const end = status === 'completed' ? faker.date.between({ from: start, to: new Date() }) : faker.date.future({ years: 1, refDate: start });
  return {
    id: `project-${i + 1}`,
    name: `${faker.company.catchPhraseAdjective()} ${faker.company.catchPhraseNoun()} Rollout`,
    client_name: faker.company.name(),
    status,
    start_date: isoDate(start),
    end_date: isoDate(end),
    budget: faker.number.int({ min: 50_000, max: 2_000_000 }),
    priority: faker.number.int({ min: 1, max: 5 }),
    description: faker.company.buzzPhrase(),
  };
});

// ---------- Generate relationships ----------

const hasSkill = [];
for (const person of people) {
  const n = faker.number.int({ min: 4, max: 8 });
  for (const skill of pickN(skills, n)) {
    hasSkill.push({
      fromId: person.id,
      toId: skill.id,
      proficiency: faker.number.int({ min: 1, max: 5 }),
      years_experience: faker.number.int({ min: 1, max: 12 }),
    });
  }
}

const workedOn = [];
const workedOnByProject = new Map();
for (const person of people) {
  const n = faker.number.int({ min: 2, max: 6 });
  for (const project of pickN(projects, n)) {
    const start = faker.date.past({ years: 2 });
    const stillOn = project.status === 'active' && faker.datatype.boolean({ probability: 0.5 });
    workedOn.push({
      fromId: person.id,
      toId: project.id,
      role: faker.helpers.arrayElement(['Engineer', 'Tech Lead', 'Consultant', 'Analyst', 'Designer', 'Project Manager']),
      start_date: isoDate(start),
      end_date: stillOn ? null : isoDate(faker.date.between({ from: start, to: new Date() })),
      allocation_pct: faker.helpers.arrayElement([25, 50, 75, 100]),
    });
    if (!workedOnByProject.has(project.id)) workedOnByProject.set(project.id, []);
    workedOnByProject.get(project.id).push(person.id);
  }
}

const memberOf = [];
for (const person of people) {
  const currentTeam = faker.helpers.arrayElement(teams);
  memberOf.push({
    fromId: person.id,
    toId: currentTeam.id,
    role: faker.helpers.arrayElement(['Individual Contributor', 'Team Lead', 'Member']),
    start_date: isoDate(faker.date.past({ years: 3 })),
    end_date: null,
  });
  if (faker.datatype.boolean({ probability: 0.25 })) {
    const pastTeam = faker.helpers.arrayElement(teams.filter((t) => t.id !== currentTeam.id));
    const pastStart = faker.date.past({ years: 5 });
    memberOf.push({
      fromId: person.id,
      toId: pastTeam.id,
      role: 'Member',
      start_date: isoDate(pastStart),
      end_date: isoDate(faker.date.between({ from: pastStart, to: new Date() })),
    });
  }
}

const delivers = projects.map((project) => ({
  fromId: faker.helpers.arrayElement(teams).id,
  toId: project.id,
}));

const requiresSkill = [];
for (const project of projects) {
  const n = faker.number.int({ min: 3, max: 6 });
  for (const skill of pickN(skills, n)) {
    requiresSkill.push({
      fromId: project.id,
      toId: skill.id,
      min_proficiency: faker.number.int({ min: 2, max: 4 }),
      seniority_needed: faker.helpers.arrayElement(SENIORITIES),
      headcount_needed: faker.number.int({ min: 1, max: 3 }),
    });
  }
}

// Org hierarchy: only allow higher-seniority -> lower-seniority edges, so the
// graph is guaranteed acyclic without needing separate cycle detection.
const manages = [];
const seniorityRank = Object.fromEntries(SENIORITIES.map((s, i) => [s, i]));
const potentialManagers = people.filter((p) => seniorityRank[p.seniority] >= 2);
const managerAssignments = pickN(people, 25);
for (const report of managerAssignments) {
  const eligibleManagers = potentialManagers.filter((m) => seniorityRank[m.seniority] > seniorityRank[report.seniority]);
  if (eligibleManagers.length === 0) continue;
  const manager = faker.helpers.arrayElement(eligibleManagers);
  if (manager.id === report.id) continue;
  manages.push({ fromId: manager.id, toId: report.id });
}

const endorsed = [];
for (const [, projectPeople] of workedOnByProject) {
  if (projectPeople.length < 2) continue;
  const pairsToGenerate = Math.min(3, projectPeople.length);
  for (let i = 0; i < pairsToGenerate; i++) {
    const [endorser, endorsee] = faker.helpers.arrayElements(projectPeople, 2);
    if (!endorser || !endorsee || endorser === endorsee) continue;
    const endorseeSkills = hasSkill.filter((hs) => hs.fromId === endorsee);
    if (endorseeSkills.length === 0) continue;
    const skillToEndorse = faker.helpers.arrayElement(endorseeSkills);
    endorsed.push({
      fromId: endorser,
      toId: endorsee,
      skill_id: skillToEndorse.toId,
      rating: faker.number.int({ min: 3, max: 5 }),
      note: faker.lorem.sentence(),
      date: isoDate(faker.date.past({ years: 1 })),
    });
  }
}

// ---------- Load into CognoDB ----------

async function run(cypher, params) {
  await driver.executeQuery(cypher, params, { database: 'neo4j' });
}

async function main() {
  console.log('[seed] verifying connectivity...');
  await driver.verifyConnectivity();
  console.log('[seed] connected.');

  if (RESET) {
    console.log('[seed] --reset flag set: wiping all nodes and relationships...');
    await run('MATCH (n) DETACH DELETE n', {});
  }

  console.log('[seed] ensuring uniqueness constraints...');
  await run('CREATE CONSTRAINT person_id IF NOT EXISTS FOR (p:Person) REQUIRE p.id IS UNIQUE', {});
  await run('CREATE CONSTRAINT skill_id IF NOT EXISTS FOR (s:Skill) REQUIRE s.id IS UNIQUE', {});
  await run('CREATE CONSTRAINT project_id IF NOT EXISTS FOR (p:Project) REQUIRE p.id IS UNIQUE', {});
  await run('CREATE CONSTRAINT team_id IF NOT EXISTS FOR (t:Team) REQUIRE t.id IS UNIQUE', {});

  console.log(`[seed] loading ${teams.length} teams...`);
  await run('UNWIND $rows AS row MERGE (t:Team {id: row.id}) SET t += row', { rows: teams });

  console.log(`[seed] loading ${skills.length} skills...`);
  await run('UNWIND $rows AS row MERGE (s:Skill {id: row.id}) SET s += row', { rows: skills });

  console.log(`[seed] loading ${people.length} people...`);
  await run('UNWIND $rows AS row MERGE (p:Person {id: row.id}) SET p += row', { rows: people });

  console.log(`[seed] loading ${projects.length} projects...`);
  await run('UNWIND $rows AS row MERGE (p:Project {id: row.id}) SET p += row', { rows: projects });

  console.log(`[seed] loading ${hasSkill.length} HAS_SKILL relationships...`);
  await run(
    `UNWIND $rows AS row
     MATCH (p:Person {id: row.fromId}), (s:Skill {id: row.toId})
     MERGE (p)-[r:HAS_SKILL]->(s)
     SET r.proficiency = row.proficiency, r.years_experience = row.years_experience`,
    { rows: hasSkill }
  );

  console.log(`[seed] loading ${relatedSkills.length} RELATED_TO relationships...`);
  await run(
    `UNWIND $rows AS row
     MATCH (a:Skill {id: row[0]}), (b:Skill {id: row[1]})
     MERGE (a)-[r:RELATED_TO]-(b)
     SET r.strength = row[2]`,
    { rows: relatedSkills }
  );

  console.log(`[seed] loading ${workedOn.length} WORKED_ON relationships...`);
  await run(
    `UNWIND $rows AS row
     MATCH (p:Person {id: row.fromId}), (proj:Project {id: row.toId})
     MERGE (p)-[r:WORKED_ON]->(proj)
     SET r.role = row.role, r.start_date = row.start_date, r.end_date = row.end_date, r.allocation_pct = row.allocation_pct`,
    { rows: workedOn }
  );

  console.log(`[seed] loading ${memberOf.length} MEMBER_OF relationships...`);
  await run(
    `UNWIND $rows AS row
     MATCH (p:Person {id: row.fromId}), (t:Team {id: row.toId})
     MERGE (p)-[r:MEMBER_OF]->(t)
     SET r.role = row.role, r.start_date = row.start_date, r.end_date = row.end_date`,
    { rows: memberOf }
  );

  console.log(`[seed] loading ${delivers.length} DELIVERS relationships...`);
  await run(
    `UNWIND $rows AS row
     MATCH (t:Team {id: row.fromId}), (proj:Project {id: row.toId})
     MERGE (t)-[:DELIVERS]->(proj)`,
    { rows: delivers }
  );

  console.log(`[seed] loading ${requiresSkill.length} REQUIRES_SKILL relationships...`);
  await run(
    `UNWIND $rows AS row
     MATCH (proj:Project {id: row.fromId}), (s:Skill {id: row.toId})
     MERGE (proj)-[r:REQUIRES_SKILL]->(s)
     SET r.min_proficiency = row.min_proficiency, r.seniority_needed = row.seniority_needed, r.headcount_needed = row.headcount_needed`,
    { rows: requiresSkill }
  );

  console.log(`[seed] loading ${manages.length} MANAGES relationships...`);
  await run(
    `UNWIND $rows AS row
     MATCH (a:Person {id: row.fromId}), (b:Person {id: row.toId})
     MERGE (a)-[:MANAGES]->(b)`,
    { rows: manages }
  );

  console.log(`[seed] loading ${endorsed.length} ENDORSED relationships...`);
  await run(
    `UNWIND $rows AS row
     MATCH (a:Person {id: row.fromId}), (b:Person {id: row.toId})
     MERGE (a)-[r:ENDORSED {skill_id: row.skill_id}]->(b)
     SET r.rating = row.rating, r.note = row.note, r.date = row.date`,
    { rows: endorsed }
  );

  console.log('[seed] done. Summary:');
  const { records } = await driver.executeQuery(
    'MATCH (n) RETURN labels(n)[0] AS label, count(*) AS count ORDER BY label',
    {},
    { database: 'neo4j' }
  );
  for (const record of records) {
    console.log(`  ${record.get('label')}: ${record.get('count').toNumber()}`);
  }
  const relSummary = await driver.executeQuery(
    'MATCH ()-[r]->() RETURN type(r) AS type, count(*) AS count ORDER BY type',
    {},
    { database: 'neo4j' }
  );
  for (const record of relSummary.records) {
    console.log(`  [${record.get('type')}]: ${record.get('count').toNumber()}`);
  }
}

main()
  .catch((err) => {
    console.error('[seed] failed:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await driver.close();
  });
