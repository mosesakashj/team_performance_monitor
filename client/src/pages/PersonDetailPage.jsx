import { Link, useParams } from 'react-router-dom';
import { usePerson, usePersonNetwork } from '../hooks/usePeople.js';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import ErrorBanner from '../components/common/ErrorBanner.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import Badge from '../components/common/Badge.jsx';
import StatusBadge from '../components/common/StatusBadge.jsx';

function InfoPill({ icon, children }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
      {icon}
      {children}
    </span>
  );
}

export default function PersonDetailPage() {
  const { id } = useParams();
  const { data: person, isLoading, isError, refetch } = usePerson(id);
  const { data: networkData, isLoading: networkLoading } = usePersonNetwork(id);

  if (isError) return <div className="animate-fade-in"><ErrorBanner message="Couldn't load this person." onRetry={refetch} /></div>;
  if (isLoading) return <LoadingSpinner label="Loading profile…" />;

  const { person: profile, skills, projects, teams } = person;

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      {/* Profile Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start gap-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 text-xl font-bold text-white shadow-lg shadow-brand-200">
            {profile.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">{profile.name}</h1>
                <p className="text-slate-500">{profile.title}</p>
              </div>
              {profile.current_utilization_pct < 100 ? (
                <StatusBadge status="active" />
              ) : (
                <span className="badge-base bg-amber-50 text-amber-700">At capacity</span>
              )}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <InfoPill icon={<svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>}>
                {profile.location}
              </InfoPill>
              <InfoPill icon={<svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}>
                {profile.timezone}
              </InfoPill>
              <InfoPill icon={<svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" /></svg>}>
                {profile.seniority}
              </InfoPill>
              <InfoPill icon={<svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>}>
                {profile.weekly_capacity_hours}h/week
              </InfoPill>
              <InfoPill icon={<svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>}>
                Free from {profile.available_from}
              </InfoPill>
            </div>
            {profile.current_utilization_pct < 100 && (
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm text-slate-500 mb-1.5">
                  <span>Capacity utilization</span>
                  <span className="font-medium text-slate-700">{profile.current_utilization_pct}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full transition-all ${profile.current_utilization_pct > 80 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                    style={{ width: `${profile.current_utilization_pct}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Skills */}
      <section className="animate-slide-up">
        <h2 className="mb-4 section-heading">Skills</h2>
        {skills.filter((s) => s.skillId).length === 0 ? (
          <EmptyState title="No skills recorded" icon="⚡" />
        ) : (
          <div className="flex flex-wrap gap-2">
            {skills
              .filter((s) => s.skillId)
              .sort((a, b) => b.proficiency - a.proficiency)
              .map((skill) => (
                <Link
                  key={skill.skillId}
                  to={`/skills/${skill.skillId}`}
                  className="group flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm transition-all hover:border-brand-300 hover:bg-brand-50"
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-100 text-[10px] font-bold text-brand-700">
                    {skill.proficiency}
                  </span>
                  <span className="font-medium text-slate-700 group-hover:text-brand-700">{skill.name}</span>
                  <span className="text-xs text-slate-400">{skill.yearsExperience}y</span>
                </Link>
              ))}
          </div>
        )}
      </section>

      {/* Team Memberships */}
      <section className="animate-slide-up">
        <h2 className="mb-4 section-heading">Team memberships</h2>
        {teams.filter((t) => t.teamId).length === 0 ? (
          <EmptyState title="Not assigned to a team" icon="👥" />
        ) : (
          <ul className="list-container">
            {teams
              .filter((t) => t.teamId)
              .map((team) => (
                <li key={`${team.teamId}-${team.startDate}`} className="list-item">
                  <div>
                    <Link to={`/teams/${team.teamId}`} className="font-medium text-slate-800 hover:text-brand-700 transition-colors">
                      {team.name}
                    </Link>
                    <p className="text-xs text-slate-400">{team.role}</p>
                  </div>
                  <span className="text-xs text-slate-400">{team.endDate ? `until ${team.endDate}` : 'current'}</span>
                </li>
              ))}
          </ul>
        )}
      </section>

      {/* Project History */}
      <section className="animate-slide-up">
        <h2 className="mb-4 section-heading">Project history</h2>
        {projects.filter((p) => p.projectId).length === 0 ? (
          <EmptyState title="No project history yet" icon="📋" />
        ) : (
          <ul className="list-container">
            {projects
              .filter((p) => p.projectId)
              .map((proj) => (
                <li key={`${proj.projectId}-${proj.startDate}`} className="list-item">
                  <div>
                    <Link to={`/projects/${proj.projectId}`} className="font-medium text-slate-800 hover:text-brand-700 transition-colors">
                      {proj.name}
                    </Link>
                    <p className="text-xs text-slate-400">
                      {proj.role} · {proj.allocationPct}% allocation
                    </p>
                  </div>
                  <span className="text-xs text-slate-400">{proj.endDate ? `ended ${proj.endDate}` : 'ongoing'}</span>
                </li>
              ))}
          </ul>
        )}
      </section>

      {/* Collaboration Network */}
      <section className="animate-slide-up">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="section-heading">Collaboration network</h2>
          <Link to="/connections" className="btn-ghost text-brand-600 hover:text-brand-700">
            Trace a connection
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </Link>
        </div>
        <p className="mb-4 text-sm text-slate-500">People {profile.name.split(' ')[0]} has worked alongside on shared projects.</p>
        {networkLoading ? (
          <LoadingSpinner label="Mapping collaborators…" />
        ) : networkData.colleagues.length === 0 ? (
          <EmptyState title="No shared-project collaborators yet" icon="🤝" />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {networkData.colleagues.map((c) => (
              <Link
                key={c.colleague.id}
                to={`/people/${c.colleague.id}`}
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 transition-all hover:border-brand-300 hover:shadow-sm"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
                  {c.colleague.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-800 hover:text-brand-700">{c.colleague.name}</p>
                  <p className="truncate text-xs text-slate-400">{c.colleague.title}</p>
                </div>
                <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                  {c.sharedProjects} shared
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
