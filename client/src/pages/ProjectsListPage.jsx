import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProjectsList } from '../hooks/useProjects.js';
import { useTeamsList } from '../hooks/useTeams.js';
import { useUrlFilters } from '../hooks/useUrlFilters.js';
import ErrorBanner from '../components/common/ErrorBanner.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import StatusBadge from '../components/common/StatusBadge.jsx';
import FilterBar, { FilterSelect } from '../components/common/FilterBar.jsx';
import Pagination from '../components/common/Pagination.jsx';
import { SkeletonGrid } from '../components/common/Skeleton.jsx';

const STATUSES = [
  { value: 'proposed', label: 'Proposed' },
  { value: 'active', label: 'Active' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'completed', label: 'Completed' },
];

const PAGE_SIZE = 24;

export default function ProjectsListPage() {
  const { filters, setFilter } = useUrlFilters({ status: '', teamId: '', page: '1' });
  const page = Math.max(1, parseInt(filters.page || '1', 10));
  const offset = (page - 1) * PAGE_SIZE;

  const { data: teamsData } = useTeamsList();
  const { data, isLoading, isError, refetch } = useProjectsList({
    status: filters.status || undefined,
    teamId: filters.teamId || undefined,
    limit: PAGE_SIZE,
    offset,
  });

  const projects = data?.projects ?? [];
  const total = data?.total ?? projects.length;
  const hasMore = total > offset + PAGE_SIZE;

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div>
        <h1 className="page-heading">Projects</h1>
        <p className="page-description">Browse engagements and open a project to see recommended staffing.</p>
      </div>

      <FilterBar>
        <FilterSelect
          value={filters.status}
          onChange={(val) => {
            setFilter('status', val);
            setFilter('page', '1');
          }}
          placeholder="Any status"
          options={STATUSES}
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
      </FilterBar>

      {isError ? (
        <ErrorBanner message="Couldn't load projects." onRetry={refetch} />
      ) : isLoading ? (
        <SkeletonGrid count={6} cols={3} />
      ) : projects.length === 0 ? (
        <EmptyState
          title="No matching projects"
          description="Try a different status or team filter."
          icon="📁"
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Link
                key={project.id}
                to={`/projects/${project.id}`}
                className="card-base group relative overflow-hidden transition-all hover:border-brand-300 hover:shadow-md hover:shadow-brand-50"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-slate-900 group-hover:text-brand-700 transition-colors">{project.name}</h3>
                  <StatusBadge status={project.status} />
                </div>
                <p className="mt-1 text-sm text-slate-500">{project.client_name}</p>
                <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-3">
                    {project.teamName && (
                      <span className="flex items-center gap-1">
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                        </svg>
                        {project.teamName}
                      </span>
                    )}
                  </div>
                  <span className="flex items-center gap-1">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                    </svg>
                    Priority {project.priority}/5
                  </span>
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
