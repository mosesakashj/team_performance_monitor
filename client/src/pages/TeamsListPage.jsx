import { Link } from 'react-router-dom';
import { useTeamsList } from '../hooks/useTeams.js';
import ErrorBanner from '../components/common/ErrorBanner.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import { SkeletonGrid } from '../components/common/Skeleton.jsx';

export default function TeamsListPage() {
  const { data, isLoading, isError, refetch } = useTeamsList();

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div>
        <h1 className="page-heading">Teams</h1>
        <p className="page-description">Departments and the projects they deliver.</p>
      </div>

      {isError ? (
        <ErrorBanner message="Couldn't load teams." onRetry={refetch} />
      ) : isLoading ? (
        <SkeletonGrid count={6} cols={3} />
      ) : data.teams.length === 0 ? (
        <EmptyState title="No teams yet" icon="👥" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.teams.map((team) => (
            <Link
              key={team.id}
              to={`/teams/${team.id}`}
              className="card-base group relative overflow-hidden transition-all hover:border-brand-300 hover:shadow-md hover:shadow-brand-50"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="relative">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 text-sm font-bold text-white shadow-lg shadow-brand-200">
                    {team.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-slate-900 group-hover:text-brand-700 transition-colors">{team.name}</h3>
                    <p className="text-sm text-slate-500">{team.department}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.25 0 015.25 0z" />
                    </svg>
                    {team.memberCount} member{team.memberCount === 1 ? '' : 's'}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
                    </svg>
                    {team.projectCount} project{team.projectCount === 1 ? '' : 's'}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
