import { useState } from 'react';
import { usePeopleList } from '../hooks/usePeople.js';
import { useSkillsList } from '../hooks/useSkills.js';
import { useTeamsList } from '../hooks/useTeams.js';
import { useDebouncedValue } from '../hooks/useDebouncedValue.js';
import { useUrlFilters } from '../hooks/useUrlFilters.js';
import ErrorBanner from '../components/common/ErrorBanner.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import StatusBadge from '../components/common/StatusBadge.jsx';
import FilterBar, { FilterInput, FilterSelect, FilterCheckbox } from '../components/common/FilterBar.jsx';
import Pagination from '../components/common/Pagination.jsx';
import { SkeletonGrid } from '../components/common/Skeleton.jsx';
import { Link } from 'react-router-dom';

const PAGE_SIZE = 24;

export default function PeopleListPage() {
  const { filters, setFilter } = useUrlFilters({
    search: '',
    skillId: '',
    teamId: '',
    availableOnly: '',
    page: '1',
  });

  const [localSearch, setLocalSearch] = useState(filters.search);
  const debouncedSearch = useDebouncedValue(localSearch);

  const page = Math.max(1, parseInt(filters.page || '1', 10));
  const offset = (page - 1) * PAGE_SIZE;

  const { data: skillsData } = useSkillsList();
  const { data: teamsData } = useTeamsList();
  const { data, isLoading, isError, refetch } = usePeopleList({
    search: debouncedSearch || undefined,
    skillId: filters.skillId || undefined,
    teamId: filters.teamId || undefined,
    availableOnly: filters.availableOnly === 'true' || undefined,
    limit: PAGE_SIZE,
    offset,
  });

  const people = data?.people ?? [];
  const total = data?.total ?? people.length;
  const hasMore = total > offset + PAGE_SIZE;

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div>
        <h1 className="page-heading">People</h1>
        <p className="page-description">Browse the team roster and filter by skill, team, or availability.</p>
      </div>

      <FilterBar>
        <FilterInput
          value={localSearch}
          onChange={(val) => {
            setLocalSearch(val);
            setFilter('page', '1');
          }}
          placeholder="Search by name or title…"
        />
        <FilterSelect
          value={filters.skillId}
          onChange={(val) => {
            setFilter('skillId', val);
            setFilter('page', '1');
          }}
          placeholder="Any skill"
          options={skillsData?.skills?.map((s) => ({ value: s.id, label: s.name })) ?? []}
        />
        <FilterSelect
          value={filters.teamId}
          onChange={(val) => {
            setFilter('teamId', val);
            setFilter('page', '1');
          }}
          placeholder="Any team"
          options={teamsData?.teams?.map((t) => ({ value: t.id, label: t.name })) ?? []}
        />
        <FilterCheckbox
          checked={filters.availableOnly === 'true'}
          onChange={(val) => {
            setFilter('availableOnly', val ? 'true' : '');
            setFilter('page', '1');
          }}
          label="Available only"
        />
      </FilterBar>

      {isError ? (
        <ErrorBanner message="Couldn't load the people list." onRetry={refetch} />
      ) : isLoading ? (
        <SkeletonGrid count={6} cols={3} />
      ) : people.length === 0 ? (
        <EmptyState
          title="No matching people"
          description="Try clearing a filter or searching for a different name."
          icon="👤"
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {people.map((person) => (
              <Link
                key={person.id}
                to={`/people/${person.id}`}
                className="card-base group relative overflow-hidden transition-all hover:border-brand-300 hover:shadow-md hover:shadow-brand-50"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
                        {person.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <h3 className="truncate font-semibold text-slate-900 group-hover:text-brand-700 transition-colors">{person.name}</h3>
                        <p className="truncate text-sm text-slate-500">{person.title}</p>
                      </div>
                    </div>
                  </div>
                  {person.current_utilization_pct < 100 ? (
                    <StatusBadge status="active" />
                  ) : (
                    <span className="badge-base bg-amber-50 text-amber-700">At capacity</span>
                  )}
                </div>
                <div className="mt-3 flex items-center gap-3 text-xs text-slate-400">
                  {person.primaryTeam && (
                    <span className="flex items-center gap-1">
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                      </svg>
                      {person.primaryTeam}
                    </span>
                  )}
                  {person.location && (
                    <span className="flex items-center gap-1">
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                      </svg>
                      {person.location}
                    </span>
                  )}
                  <span className="ml-auto">{person.current_utilization_pct}% util</span>
                </div>
              </Link>
            ))}
          </div>
          <Pagination offset={offset} limit={PAGE_SIZE} total={total} onChange={(newOffset) => setFilter('page', String(Math.floor(newOffset / PAGE_SIZE) + 1))} />
        </>
      )}
    </div>
  );
}
