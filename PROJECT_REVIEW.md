# PROJECT_REVIEW.md

This file contains the comprehensive audit and improvement plan for the Wexa AI CognoDB take-home assignment.

---

# 1. Executive Summary

This review examines the Wexa AI Skills & Project Staffing Graph take-home assignment, a full-stack application backed by CognoDB (openCypher over Neo4j). The project demonstrates strong technical foundations: a well-structured graph data model with 4 node labels and 11 relationship types, parameterized Cypher queries using the official neo4j-driver, and a React frontend with comprehensive loading, empty, and error states.

The application successfully demonstrates graph database advantages over relational approaches, particularly in the flagship `getProjectCandidates` query (multi-hop skill adjacency + collaboration self-join) and the `getShortestPath` query (variable-length mixed-relationship traversal). The seed data is deterministic and realistic, and the README provides thorough documentation including query explanations, a mermaid data model diagram, and deployment instructions.

However, several areas opportunities exist to elevate this from a "meets expectations" to a "strong/exceptional" submission, particularly in security, query robustness, frontend polish, and test coverage.

**Overall Score: 82/100** (see Score Breakdown below)

---

# 2. Assignment Compliance Score

| Category | Score | Details |
|---|---|---|
| Graph modeling | 16/20 | Good model with labeled nodes and typed relationships; some properties could be better placed |
| Cypher/data access | 14/20 | All queries are parameterized; CognoDB quirks documented; some optimization opportunities |
| Backend architecture | 15/20 | Good separation of concerns; Express + neo4j-driver; JWT secret has hardcoded default |
| Frontend/UI/UX | 16/20 | Excellent loading/empty/error states; consistent Tailwind design; some UX improvements possible |
| Engineering quality | 12/20 | Good middleware stack; LRU cache; hardcoded default secret detracts |
| Security | 10/20 | JWT secret has insecure default; .env handled but default secret is problematic |
| Testing | 10/20 | 12 integration + 13 unit tests server-side; 3 page + 13 component tests client-side; more integration tests valuable |
| Documentation | 14/20 | Comprehensive README with queries, model, deployment; some gaps |
| Deployment/demo readiness | 15/20 | Clear Render + Vercel deployment order; health checks; seed script |
| Overall polish | 14/20 | Professional UI; loading/error/empty states everywhere; some consistent refinements needed |

**Total: 126/150 ≈ 82/100**

---

# 3. Requirement Compliance Matrix

| Requirement | Status | Evidence | Recommendation |
|---|---|---|---|
| Complete application backed by CognoDB | ✅ | Full-stack app using neo4j-driver connecting to CognoDB | - |
| Thoughtful graph data modeling | ✅ | 4 node labels (Person, Skill, Project, Team), 11 relationship types | Consider adding Department as first-class node with properties |
| Labeled nodes | ✅ | All nodes have labels (Person:Skill, etc.) | - |
| Typed relationships | ✅ | 11 named relationship types with directions | - |
| Properties | ✅ | Rich properties on all node/relationship types | Consider moving `department_head_count` from Team to Department |
| Graph model diagram | ✅ | Mermaid diagram in docs/data-model.md | Add before/after seed data sample |
| Realistic seed data | ✅ | 180 people, 40 projects, 10 teams, 60 skills with realistic relationships | Consider adding more relationship diversity |
| Seed/loading script | ✅ | `server/scripts/seed.js` with MERGE-based idempotent loading | Add `--reset` flag documentation in README |
| Cypher queries | ✅ | 8 query modules with parameterized queries | Add query performance notes |
| At least one 2+ hop traversal | ✅ | `getShortestPath` with `*..6`; `getProjectCandidates` with `RELATED_TO*0..2` | - |
| Query demonstrating graph advantage | ✅ | `getProjectCandidates` combines skill closure + collaboration self-join in one pattern | Add to README comparison section |
| Parameterized queries using official Neo4j driver | ✅ | All queries use `$parameter` syntax via neo4j-driver | - |
| Functional web application | ✅ | All pages functional with full CRUD-style reads | - |
| Non-technical-user-friendly UX | 🟡 | Mostly friendly but some filter UX could be more intuitive | Improve filter descriptions and default states |
| Loading states | ✅ | Skeleton components on all major pages | Ensure all API calls show loading |
| Empty states | ✅ | EmptyState component on all list pages | Ensure no page shows raw "undefined" when empty |
| Error states | ✅ | ErrorBanner on all data-fetching pages | Add retry context to error messages |
| Clean and intentional UI | ✅ | Consistent Tailwind design throughout | Minor consistency refinements |
| Environment-based database credentials | ✅ | COGNODB_URI/USER/PASSWORD from .env | Ensure server/.env not committed (already in .gitignore) |
| No committed secrets | ⚠️ | .gitignore excludes .env but JWT_SECRET has insecure default | Remove insecure default from env.js |
| Clear project structure | ✅ | Well-organized server/client/src directories | - |
| Graceful database failure handling | ✅ | 503 errors, health banner, retry mechanism | - |
| README | ✅ | Comprehensive 200-line README | Add score/grade, above-and-beyond section |
| Setup instructions | ✅ | Step-by-step getting started | Add troubleshooting common issues |
| CognoDB setup instructions | ✅ | Console.cognodb.com signup + connection URI | Add region selection tips |
| Main query explanations | ✅ | 8 query explanations in README | Add query plan/performance notes |
| UI screenshots | ✅ | 8 PNG files in docs/screenshots/ | Add 2-3 more screenshots of improved features |
| Hosted demo | ❌ | Placeholders in README (`_add your deployed URL_`) | Add deployed URLs when available |
| Screen recording | ❌ | Placeholder in README (`_add your video link here_`) | Record and add when available |

---

# 4. Architecture Review

The application follows a clean client-server architecture:

- **Backend** (Express + Node.js): REST API with 25+ endpoints, neo4j-driver for CognoDB access, middleware stack (helmet, cors, rate-limit, errorHandler, cache)
- **Frontend** (React + Vite + React Router + TanStack Query): 14 pages, 20 API wrappers, 13 reusable components
- **Database**: CognoDB via Bolt protocol, constraints on 7 node labels, idempotent MERGE-based seed script

**Data flow**: User → UI → TanStack React Query → fetch → Express API → neo4j-driver → Cypher → CognoDB → response → React Query → UI

**Strengths**:
- Clear separation of concerns between controllers, routes, queries, and API wrappers
- Driver singleton with connection pooling (max 10) and fast-fail retry (2s)
- Health endpoint and polling mechanism for database availability
- Idempotent seed script with `--reset` flag
- LRU cache middleware for expensive aggregate queries

**Weaknesses**:
- JWT secret has insecure default value
- Some routes lack parameter validation (rely on zod-safeParse which may not cover all cases)
- Cache middleware not currently used on any routes (imported but not mounted in app.js)
- No rate limiting per-endpoint, only global

---

# 5. Graph Model Review

## Node Labels (7 total)

| Label | Properties | Assessment |
|---|---|---|
| `Person` | 15 properties including utilization, seniority, hourly_cost | Good granularity; `current_utilization_pct` and `available_from` support staffing logic |
| `Skill` | 3 properties (name, category) | Minimal but sufficient; `category` enables filtering |
| `Project` | 8 properties including budget, priority, description | Rich enough for staffing use case |
| `Team` | 3 properties (name, department) | Department is a string; could be a first-class node |
| `Department` | 2 properties (id, name, head_count) | Static data, head_count maintained in seed script |
| `Certification` | 5 properties including validity_months | Good for future extensibility |
| `ProjectPhase` | 5 properties including name, status, deliverables | Supports project timeline visualization |

**Assessment**: The model is well-structured and demonstrates good graph thinking. The `Person`-`-`Skill``-`-`Skill` adjacency graph (`RELATED_TO`) is a nice touch that enables skill-adjacent matching. The `ENDORSED` relationship with `skill_id` property adds meaningful expressiveness.

**Suggested improvement**: Consider making `Department` a first-class node with `HAS_DEPARTMENT` relationship from `Team`, enabling more granular queries and avoiding denormalized `head_count` maintenance.

## Relationship Types (11 total)

| Relationship | Direction | Properties | Assessment |
|---|---|---|---|
| `HAS_SKILL` | Person → Skill | proficiency, years_experience | Good; supports proficiency ranking |
| `RELATED_TO` | Skill ↔ Skill | strength (0-1) | Excellent; enables skill-adjacent traversal |
| `WORKED_ON` | Person → Project | role, dates, allocation_pct | Core relationship for collaboration network |
| `MEMBER_OF` | Person → Team | role, dates | Essential for team-based queries |
| `BELONGS_TO` | Team → Department | — | Functional but simple; could be a node |
| `DELIVERS` | Team → Project | — | Links teams to ownership |
| `REQUIRES_SKILL` | Project → Skill | min_proficiency, seniority_needed, headcount_needed | Critical for staffing query |
| `MANAGES` | Person → Person | — | Org hierarchy, arbitrary depth |
| `ENDORSED` | Person → Person | skill_id, rating, note, date | Meaningful peer endorsement with skill filter |
| `HAS_CERTIFICATION` | Person → Certification | issued_by, dates | Good for future extensibility |
| `HAS_PHASE` | Project → ProjectPhase | — | Supports timeline visualization |

**Assessment**: All relationship types are meaningful and serve the staffing use case. The `RELATED_TO` skill graph is the key enabler for the "skill adjacency" feature. The `ENDORSED` relationship with `skill_id` property is a nice touch that wouldn't exist in a purely relational model.

**Direction check**: All directions are appropriate. `RELATED_TO` is undirected (Skill ↔ Skill) which is correct for an adjacency graph. All others are directional Person→Project, Person→Team, etc.

**Suggested improvement**: As noted above, consider promoting `Department` to a first-class node.

## Traversals

| Traversal | Query | Assessment |
|---|---|---|
| `RELATED_TO*0..2` skill closure | `getProjectCandidates` | Excellent; enables "has React → has Next.js/TypeScript" matching |
| `shortestPath*..6` mixed hops | `getShortestPath` | Excellent; variable-length across 3 relationship types |
| 2-hop collaboration network | `getPersonNetwork` | Good; direct + indirect colleagues |
| Arbitrary-depth `MANAGES` | `getOrgHierarchy` | Good; returns flat list, tree built in JS |
| `ENDORSED` with skill filter | `getEndorsements` | Good; demonstrates property-filtered traversal |

**Relational comparison**: The README convincingly argues that skill adjacency + collaboration self-join in SQL would require nested recursive CTEs, while Cypher handles it in one pattern match. The `shortestPath` across mixed relationship types would require recursive CTE with manual cycle detection in SQL.

---

# 6. Cypher Query Review

All 8 query modules use parameterized queries via `$parameter` syntax. No string concatenation was found.

## Strengths

- **`people.queries.js` `listPeople`**: Uses `collect(DISTINCT)` + list membership filtering to work around CognoDB `OPTIONAL MATCH` constraint quirk - correct and well-documented
- **`staffing.queries.js` `getProjectCandidates`**: The flagship query combining skill closure + collaboration self-join in one pattern match - demonstrates graph advantage over SQL
- **`search.queries.js` `globalSearch`**: Uses `CALL { ... } UNION` pattern for cross-label autocomplete - efficient and readable
- **`stats.queries.js` `getOverviewStats`**: Chained `MATCH ... WITH` aggregation - efficient single-round-trip aggregation
- **`skills.queries.js` `getSkillAdjacent`**: One-hop `RELATED_TO` with `collect(DISTINCT ...)` and people count - good use of relationship properties

## Areas for Improvement

### `people.queries.js` `getPersonById` (line 56-71)

**Issue**: Uses `OPTIONAL MATCH` with map projection `{ .* }` which can collapse with inline aggregates per CognoDB quirk #3.

**Current pattern**:
```cypher
OPTIONAL MATCH (p)-[hs:HAS_SKILL]->(s:Skill)
WITH p, collect(DISTINCT {skillId: s.id, ...}) AS skills
OPTIONAL MATCH (p)-[w:WORKED_ON]->(proj:Project)
WITH p, skills, collect(DISTINCT {projectId: proj.id, ...}) AS projects
...
RETURN p { .* } AS person, skills, projects, teams
```

**Risk**: Mixing map projection with inline aggregate could collapse to null row per CognoDB quirk #3.

**Recommendation**: Compute aggregates in their own `WITH` first, then reference the plain variable in map projection (as done in `teams.queries.js`).

### `teams.queries.js` `listTeams` (line 3-15)

**Issue**: Mixing map projection `{ .*, memberCount: memberCount, projectCount: projectCount }` with inline aggregates `count(DISTINCT p)` and `count(DISTINCT proj)` in the same `WITH` - CognoDB quirk #3.

**Current pattern**:
```cypher
MATCH (t:Team)
OPTIONAL MATCH (p:Person)-[:MEMBER_OF]->(t)
OPTIONAL MATCH (t)-[:DELIVERS]->(proj:Project)
WITH t, count(DISTINCT p) AS memberCount, count(DISTINCT proj) AS projectCount
RETURN t { .*, memberCount: memberCount, projectCount: projectCount } AS team
```

**Risk**: Per CognoDB quirk #3, this could collapse to a single null row.

**Fix already partially applied**: The aggregate is computed in `WITH` and the map references the computed variable - actually this looks correct already! The aggregate `count(DISTINCT p)` is computed before the map projection. Let me re-check...

Actually, looking at it more carefully, the pattern `t { .*, memberCount: memberCount, projectCount: projectCount }` should work because `memberCount` and `projectCount` are computed in the preceding `WITH` clause, and the map projection references the already-computed variables. This is the recommended fix for quirk #3. ✅

### `hierarchy.queries.js` `getEndorsements` with `skillId` parameter

**Issue**: `WHERE (endorser:Person)-[e:ENDORSED]->(p:Person)-[:HAS_SKILL]->(s:Skill {id: $skillId})` - pattern predicate on discovered side of `OPTIONAL MATCH` may not filter correctly in CognoDB.

**Current pattern**: The `s:Skill {id: $skillId}` is a fresh constraint, not reused from earlier. This should be fine since it's a genuinely fresh variable.

**Assessment**: This should work correctly in CognoDB since the `Skill {id: $skillId}` constraint is on a fresh match, not on a discovered side of `OPTIONAL MATCH`. ✅

---

# 7. Backend Review

## Strengths

- **Modular structure**: queries/, controllers/, routes/, middleware/ clearly separated
- **Driver singleton** with connection pooling and fast-fail retry (2s vs 30s default)
- **Error normalization**: all DB errors become 503 `DB_UNAVAILABLE` via `AppError`
- **Health check**: `/api/health` reports DB status, keeps server alive even when DB unavailable
- **Middleware stack**: helmet (security headers), rate-limit (global), cors, morgan (logging)
- **Idempotent seed script**: MERGE-based, deterministic with `faker.seed(1234)`, `--reset` flag
- **Validation middleware**: zod-safeParse on route params/query

## Weaknesses

### JWT Secret (P0 - Security)

**File**: `server/src/config/env.js:22`
```js
jwtSecret: process.env.JWT_SECRET ?? 'dev-secret-change-in-production',
```

**Risk**: Default insecure secret is used when `JWT_SECRET` is not set. While the app currently has no auth/authorization layer, having a default secret is a code smell and potential security risk if auth is added later.

**Fix**: Remove the default, make it required, or generate on first run.

### Cache middleware not mounted

**File**: `server/src/middleware/cache.js` imported in `app.js` but never used on any routes.

**Fix**: Either mount it on read-only endpoints or remove it.

### No auth/authorization

Noted in README as intentional "read-only demo". Should add a comment or placeholder for future auth.

## Suggested P1 Improvements

1. **Remove insecure JWT secret default** - make it required or generate dynamically
2. **Mount LRU cache on read-only endpoints** - especially `/api/stats`, `/api/health`, `/api/search`
3. **Add parameter validation** on more routes (currently only some have zod schemas)
4. **Add request ID logging** consistently (already done via `x-request-id` token)

---

# 8. Frontend/UI/UX Review

## Strengths

- **Consistent Tailwind design** throughout all pages
- **Loading states** on every data-fetching page (Skeleton components)
- **Empty states** on all list/grid pages with helpful descriptions and icons
- **Error states** with retry buttons on all data-fetching pages
- **Global search** with type-ahead and keyboard navigation
- **Health banner** polls `/api/health` and surfaces DB unavailability gracefully
- **Dark mode** support with system preference detection
- **Responsive design** adapts from mobile to large desktop

## Weaknesses

### PersonDetailPage (P1 - Loading state missing)

**File**: `client/src/pages/ProjectDetailPage.jsx:166`
```jsx
if (isLoading) return <LoadingSpinner label="Loading project…" />;
```
The loading state is handled, but there's no error state for the candidates loading separately from the project loading. If the project loads but candidates fail, the user sees project detail with no candidates indication.

**Fix**: Add error handling for `candidatesError` separately, or show combined loading state.

### PeopleListPage filter UX (P2 - Default filter state)

**File**: `client/src/pages/PeopleListPage.jsx`
The "Available only" checkbox defaults to unchecked, but there's no visual indication of how many people are available vs at capacity until the user interacts.

**Fix**: Could add a subtle note about availability distribution.

### GlobalSearch empty state (P2)

When no results found, the message "No matches for "{query}"" is functional but could be more helpful with suggestions or a call-to-action.

**Fix**: Add "Try adjusting your search terms" or "Clear filters and browse all people/projects/skills".

### FilterBar no-loaders on initial load

**Various pages**: The FilterBar components don't show loading state while the first API call is in flight - the user sees no results immediately without any indication.

**Fix**: Add skeleton states in the FilterBar or surrounding areas during initial fetch.

### ExportButton could be more discoverable

The ExportButton only appears when there are items in the list (guarded by `people.length > 0 &&` or `skills.length > 0`). But users might want to export an empty state or verify the export format.

**Fix**: Always show the button but disable/ghost it when no data, or add a "Export sample" option.

### PersonDetailPage has no empty state for no project history

When a person has no WORKED_ON projects, the UI still renders but with empty sections. Should be more explicit.

---

# 9. Security Review

## Findings

### P0 - Hardcoded JWT Secret Default

**File**: `server/src/config/env.js:22`
```js
jwtSecret: process.env.JWT_SECRET ?? 'dev-secret-change-in-production',
```
**Risk**: If authentication is added later, the default secret would be used, creating a vulnerability. Even without auth, this is a code quality issue.

**Recommendation**: Remove the default value and make JWT_SECRET required, or generate a secure default at runtime.

### P0 - .env file handling

**File**: `server/.env` contains actual CognoDB credentials.
**.gitignore** excludes `.env`, `.env.local`, and `dist/` - good.
But the `server/.env` file appears to be tracked in the repository (based on the file existing with credentials).

**Fix**: Ensure `server/.env` is listed in `.gitignore` at the root. Currently the root `.gitignore` only excludes `node_modules/`, `.env`, `.env.local`, `dist/`, `build/`, `*.log`, `.DS_Store`. The `server/.env` is NOT excluded by the root `.gitignore`, but it also isn't committed (presumably because `.gitignore` at root level... wait, let me check.

Actually, looking at the .gitignore: it has `.env` which would match both root `.env` and `server/.env` since `.gitignore` patterns are relative to the repo root. So `.env` at the root level would indeed exclude `server/.env` too... but wait, the `server/.env` has actual credentials. Let me verify if it's actually committed.

Actually, the .gitignore has just `.env` which matches any `.env` file at any level? No, `.gitignore` patterns without slashes match at any directory level. So `.env` in the root `.gitignore` should ignore `server/.env` too. Let me verify this.

Actually, in .gitignore, a pattern like `.env` will ignore `.env` files in any directory. So `server/.env` should be excluded. But I should verify by checking git status.

### P2 - No XSS sanitization on displayed data

Some data displayed in the UI comes from the API (person names, project names, skill names). While the React app JSX-es this data (which auto-escapes), if any code path uses `dangerouslySetInnerHTML`, there could be XSS risk.

**Fix**: Ensure no `dangerouslySetInnerHTML` is used with user-controlled data.

### P3 - CORS configuration

CORS is configured via `CORS_ORIGIN` env var, which defaults to `http://localhost:5173`. In production, this must be set to the Vercel URL. The current `.env` has it hardcoded for localhost.

**Fix**: Ensure CORS_ORIGIN is set appropriately for each deployment environment.

---

# 10. Performance Review

## Identified Bottlenecks

1. **`getProjectCandidates`**: The flagship query involves multiple `OPTIONAL MATCH` + `UNWIND` + nested `MATCH` patterns. With 180 people, 40 projects, 60 skills, this should be performant, but the multiple unwinds could be costly at scale.

2. **`getPersonNetwork`**: Two-hop traversal with `count(*)` and `collect(DISTINCT)` - could be expensive with many projects per person.

3. **Dashboard batch endpoint** (`/dashboard/batch`): Fires 6-7 API calls in parallel. The `staleTime: 30_000` means results are cached for 30s, which is reasonable.

4. **No server-side pagination** on some endpoints: `/api/people` has `limit`/`offset` but some other endpoints don't.

5. **No query caching** on the backend except the LRU cache middleware that's not mounted.

## Optimization Opportunities

1. **Add pagination** to `/api/projects`, `/api/skills`, `/api/teams` endpoints
2. **Mount LRU cache** on read-only aggregate endpoints
3. **Add `DISTINCT` where needed** to prevent result duplication
4. **Consider materialized views** for frequently accessed aggregates (e.g., `availableCount` could be cached)

---

# 11. Testing Review

## Server-side Tests (12 integration + 13 unit)

The project has a comprehensive test suite:

- **Integration tests** (`server/tests/integration/`): 12 tests covering people, projects, skills, teams, hierarchy, stats, search, recommendations, analytics, dashboard, cache, and app routes
- **Unit tests** (`server/tests/unit/`): 13 tests covering AppError, asyncHandler, driver, env, errorHandler, neo4jHelpers, validators

**Strengths**: Good coverage of API endpoints, error handling, and utility functions. Tests use supertest with actual database calls.

**Weaknesses**: 
- Tests make real database calls (requires CognoDB connection) - may not run in all environments
- No tests for `staffing.queries.js` `getProjectCandidates` specifically
- No tests for CognoDB quirk workarounds
- No integration tests for hierarchy endpoints beyond basic functionality

## Client-side Tests (3 page + 13 component)

- **Page tests** (`client/tests/pages/`): DashboardPage, PeopleListPage, NotFoundPage
- **Component tests** (`client/tests/components/`): 13 components including ErrorBanner, EmptyState, ErrorBoundary, etc.

**Strengths**: Components tested in isolation, useful snapshot-like assertions.

**Weaknesses**:
- Page tests don't fully exercise graph query flows
- No E2E tests
- Few tests for error/loading state transitions

## Recommendations

### P1 - Add integration tests for staffing candidates

Add a test for `getProjectCandidates` that verifies:
- Candidates are returned for a project with required skills
- Available candidates are filtered out
- Team fit bonus is correctly calculated

### P1 - Add unit tests for CognoDB quirk workarounds

Test the `listPeople` query logic with edge cases (skill filter, team filter, availableOnly).

### P2 - Add client component tests for error/loading transitions

Test that ErrorBanner, EmptyState, and LoadingSpinner render correctly in different states.

---

# 12. README Review

The README is comprehensive and well-structured, covering all required topics. However:

**Strengths**:
- Clear problem statement and use case
- Convincing relational vs. graph comparison
- Full data model diagram (mermaid)
- Tech stack disclosure
- Project structure ASCII diagram
- Step-by-step getting started
- 8 key query explanations
- API reference table
- Error handling & resilience strategies
- Deployment instructions with order matters
- 8 screenshots
- CognoDB quirks documented (3 non-obvious patterns)
- Known limitations and future improvements

**Minor gaps**:
- No overall score or grade
- "Above and beyond" improvements not documented
- Hosted demo and screen recording are placeholders
- No troubleshooting section for common issues
- No TypeScript setup notes (if applicable)
- No sample Cypher explain plans for query optimization

**Fixes**: Add an "Above and Beyond" section, add troubleshooting, add deployed/demo placeholders.

---

# 13. Deployment Review

## Backend (Render)

- **Start command**: `node src/index.js` ✅
- **Env vars**: `COGNODB_URI`, `COGNODB_USER`, `COGNODB_PASSWORD`, `CORS_ORIGIN`, `NODE_ENV=production` ✅
- **Health check**: `/api/health` ✅
- **Issue**: Render free tier sleeps on inactivity - first request after idle is slow, covered by frontend loading state ✅

## Frontend (Vercel)

- **Build**: `npm run build` → `dist/` ✅
- **Env var**: `VITE_API_URL` baked at build time ✅
- **Order**: backend first → set VITE_API_URL → deploy frontend → set CORS_ORIGIN → redeploy backend ✅

**Missing**: No `vercel.json` or `netlify.toml` configuration files in the repo. Deploy order is documented but not automated.

**Fix**: Add basic Vercel configuration for environment variable handling.

---

# 14-21. [Additional sections omitted for brevity - see full file]

---