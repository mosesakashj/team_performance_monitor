# Data Model

## Diagram

```mermaid
graph LR
  Person -->|HAS_SKILL proficiency, years_experience| Skill
  Skill -->|RELATED_TO strength| Skill
  Person -->|WORKED_ON role, start_date, end_date, allocation_pct| Project
  Person -->|MEMBER_OF role, start_date, end_date| Team
  Team -->|BELONGS_TO| Department
  Team -->|DELIVERS| Project
  Project -->|REQUIRES_SKILL min_proficiency, seniority_needed, headcount_needed| Skill
  Person -->|MANAGES| Person
  Person -->|"ENDORSED skill_id, rating"| Person
  Person -->|HAS_CERTIFICATION issued_by, issue_date, expiry_date| Certification
  Project -->|HAS_PHASE name, start_date, end_date, status| ProjectPhase
```

## Node labels

| Label | Key properties |
|---|---|
| `Person` | `id`, `name`, `email`, `title`, `seniority`, `location`, `timezone`, `weekly_capacity_hours`, `current_utilization_pct`, `available_from`, `hourly_cost` |
| `Skill` | `id`, `name`, `category` |
| `Project` | `id`, `name`, `client_name`, `status`, `start_date`, `end_date`, `budget`, `priority`, `description` |
| `Team` | `id`, `name`, `department` |
| `Department` | `id`, `name`, `head_count` |
| `Certification` | `id`, `name`, `provider`, `category`, `validity_months` |
| `ProjectPhase` | `id`, `name`, `start_date`, `end_date`, `status`, `deliverables` |

## Relationship types

| Relationship | Direction | Properties | Meaning |
|---|---|---|---|
| `HAS_SKILL` | `(Person)->(Skill)` | `proficiency` (1-5), `years_experience` | A person's asserted skill and strength |
| `RELATED_TO` | `(Skill)-(Skill)` | `strength` (0-1) | Skill-adjacency graph (e.g. Docker~Kubernetes) |
| `WORKED_ON` | `(Person)->(Project)` | `role`, `start_date`, `end_date`, `allocation_pct` | Project engagement history |
| `MEMBER_OF` | `(Person)->(Team)` | `role`, `start_date`, `end_date` | Team membership over time |
| `BELONGS_TO` | `(Team)->(Department)` | — | Which department a team belongs to |
| `DELIVERS` | `(Team)->(Project)` | — | Which team owns a project |
| `REQUIRES_SKILL` | `(Project)->(Skill)` | `min_proficiency`, `seniority_needed`, `headcount_needed` | Project staffing requirement |
| `MANAGES` | `(Person)->(Person)` | — | Org hierarchy, arbitrary depth |
| `ENDORSED` | `(Person)->(Person)` | `skill_id`, `rating`, `note`, `date` | Peer endorsement of a specific skill |
| `HAS_CERTIFICATION` | `(Person)->(Certification)` | `issued_by`, `issue_date`, `expiry_date` | Professional certifications held |
| `HAS_PHASE` | `(Project)->(ProjectPhase)` | — | Project breakdown into phases |
