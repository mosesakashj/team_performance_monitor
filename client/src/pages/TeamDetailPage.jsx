import { Link, useParams } from 'react-router-dom';
import { useTeam } from '../hooks/useTeams.js';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import ErrorBanner from '../components/common/ErrorBanner.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import StatusBadge from '../components/common/StatusBadge.jsx';

export default function TeamDetailPage() {
  const { id } = useParams();
  const { data, isLoading, isError, refetch } = useTeam(id);

  if (isError) return <div className="animate-fade-in"><ErrorBanner message="Couldn't load this team." onRetry={refetch} /></div>;
  if (isLoading) return <LoadingSpinner label="Loading team…" />;

  const { team, roster, projects } = data;

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      {/* Team Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 text-lg font-bold text-white shadow-lg shadow-brand-200">
            {team.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{team.name}</h1>
            <p className="text-slate-500">{team.department}</p>
          </div>
        </div>
        <div className="mt-5 flex gap-6 text-sm text-slate-500">
          <div>
            <span className="text-2xl font-bold text-slate-900">{roster.filter((r) => r.personId).length}</span>
            <span className="ml-1">members</span>
          </div>
          <div>
            <span className="text-2xl font-bold text-slate-900">{projects.filter((p) => p.projectId).length}</span>
            <span className="ml-1">projects delivered</span>
          </div>
        </div>
      </div>

      {/* Roster */}
      <section className="animate-slide-up">
        <h2 className="mb-4 section-heading">Roster</h2>
        {roster.filter((r) => r.personId).length === 0 ? (
          <EmptyState title="No members yet" icon="👥" />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {roster
              .filter((r) => r.personId)
              .map((person) => (
                <Link
                  key={person.personId}
                  to={`/people/${person.personId}`}
                  className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 transition-all hover:border-brand-300 hover:shadow-sm"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
                    {person.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-800">{person.name}</p>
                    <p className="truncate text-xs text-slate-400">{person.title}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                    {person.endDate ? `left ${person.endDate}` : person.role}
                  </span>
                </Link>
              ))}
          </div>
        )}
      </section>

      {/* Projects Delivered */}
      <section className="animate-slide-up">
        <h2 className="mb-4 section-heading">Projects delivered</h2>
        {projects.filter((p) => p.projectId).length === 0 ? (
          <EmptyState title="No projects yet" icon="📋" />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {projects
              .filter((p) => p.projectId)
              .map((project) => (
                <Link
                  key={project.projectId}
                  to={`/projects/${project.projectId}`}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 transition-all hover:border-brand-300 hover:shadow-sm"
                >
                  <span className="text-sm font-medium text-slate-800 hover:text-brand-700">{project.name}</span>
                  <StatusBadge status={project.status} />
                </Link>
              ))}
          </div>
        )}
      </section>
    </div>
  );
}
