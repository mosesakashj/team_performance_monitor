import { Link, useParams } from 'react-router-dom';
import { useTeam } from '../hooks/useTeams.js';
import { useTeamComposition } from '../hooks/useAnalytics.js';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import ErrorBanner from '../components/common/ErrorBanner.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import StatusBadge from '../components/common/StatusBadge.jsx';

const CATEGORY_COLORS = {
  Language: { bg: 'bg-blue-100', text: 'text-blue-700', bar: 'from-blue-400 to-blue-500' },
  Framework: { bg: 'bg-violet-100', text: 'text-violet-700', bar: 'from-violet-400 to-violet-500' },
  Cloud: { bg: 'bg-cyan-100', text: 'text-cyan-700', bar: 'from-cyan-400 to-cyan-500' },
  Data: { bg: 'bg-amber-100', text: 'text-amber-700', bar: 'from-amber-400 to-amber-500' },
  'Soft Skill': { bg: 'bg-emerald-100', text: 'text-emerald-700', bar: 'from-emerald-400 to-emerald-500' },
  Domain: { bg: 'bg-rose-100', text: 'text-rose-700', bar: 'from-rose-400 to-rose-500' },
};

function UtilizationBar({ pct, name }) {
  const color = pct > 80 ? 'from-amber-400 to-amber-500' : pct > 60 ? 'from-blue-400 to-blue-500' : 'from-emerald-400 to-emerald-500';
  return (
    <div className="flex items-center gap-3">
      <span className="w-24 shrink-0 text-xs font-medium text-slate-600 truncate">{name}</span>
      <div className="flex-1 h-3 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-10 shrink-0 text-xs font-bold text-slate-600 text-right">{pct}%</span>
    </div>
  );
}

function SkillHeatmap({ members }) {
  const skillMap = {};
  for (const member of members) {
    for (const skill of member.skills || []) {
      if (!skillMap[skill.name]) skillMap[skill.name] = { category: skill.category, holders: [] };
      skillMap[skill.name].holders.push({ name: member.name, proficiency: skill.proficiency });
    }
  }
  const skills = Object.entries(skillMap)
    .sort((a, b) => b[1].holders.length - a[1].holders.length)
    .slice(0, 12);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="space-y-2">
        {skills.map(([name, data]) => {
          const colors = CATEGORY_COLORS[data.category] || { bg: 'bg-slate-100', text: 'text-slate-600', bar: 'from-slate-400 to-slate-500' };
          const pct = members.length > 0 ? (data.holders.length / members.length) * 100 : 0;
          return (
            <div key={name} className="flex items-center gap-3">
              <span className="w-28 shrink-0 text-xs font-medium text-slate-700 truncate">{name}</span>
              <div className="flex-1 h-3 overflow-hidden rounded-full bg-slate-100">
                <div className={`h-full rounded-full bg-gradient-to-r ${colors.bar} transition-all duration-500`} style={{ width: `${pct}%` }} />
              </div>
              <span className={`w-8 shrink-0 text-[10px] font-bold ${colors.text}`}>{data.holders.length}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CollabMatrix({ pairs, members }) {
  if (!pairs?.length) return null;
  const validPairs = pairs.filter((p) => p.sharedProjects > 0);
  if (validPairs.length === 0) return null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="space-y-2">
        {validPairs.sort((a, b) => b.sharedProjects - a.sharedProjects).slice(0, 8).map((pair, i) => {
          const strength = Math.min(pair.sharedProjects, 5);
          return (
            <div key={i} className="flex items-center gap-3 py-1.5">
              <span className="w-20 shrink-0 text-xs font-medium text-slate-600 truncate">{pair.p1}</span>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }, (_, j) => (
                  <div key={j} className={`h-2 w-2 rounded-full ${j < strength ? 'bg-brand-500' : 'bg-slate-200'}`} />
                ))}
              </div>
              <span className="w-20 shrink-0 text-xs font-medium text-slate-600 truncate text-right">{pair.p2}</span>
              <span className="text-[10px] text-slate-400 ml-1">{pair.sharedProjects} shared</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function TeamDetailPage() {
  const { id } = useParams();
  const { data, isLoading, isError, refetch } = useTeam(id);
  const { data: composition, isLoading: compositionLoading } = useTeamComposition(id);

  if (isError) return <div className="animate-fade-in"><ErrorBanner message="Couldn't load this team." onRetry={refetch} /></div>;
  if (isLoading) return <LoadingSpinner label="Loading team…" />;

  const { team, roster, projects } = data;
  const validRoster = roster.filter((r) => r.personId);
  const validProjects = projects.filter((p) => p.projectId);
  const members = composition?.members ?? validRoster.map((r) => ({ ...r, skills: [] }));
  const avgUtilization = validRoster.length > 0
    ? Math.round(validRoster.reduce((s, r) => s + (r.utilization ?? r.current_utilization_pct ?? 0), 0) / validRoster.length)
    : 0;
  const allSkills = members.flatMap((m) => m.skills || []);
  const uniqueSkillCount = new Set(allSkills.map((s) => s.name)).size;

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-white to-brand-50" />
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-violet-100/30 blur-3xl" />
        <div className="relative p-8">
          <div className="flex items-center gap-5">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-violet-600 text-2xl font-bold text-white shadow-xl shadow-violet-200">
              {team.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">{team.name}</h1>
              <p className="text-lg text-slate-500 mt-1">{team.department}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Members', value: validRoster.length, color: 'text-violet-600', bg: 'bg-violet-50', icon: '👥' },
          { label: 'Projects', value: validProjects.length, color: 'text-blue-600', bg: 'bg-blue-50', icon: '📋' },
          { label: 'Unique Skills', value: uniqueSkillCount, color: 'text-emerald-600', bg: 'bg-emerald-50', icon: '⚡' },
          { label: 'Avg Utilization', value: `${avgUtilization}%`, color: 'text-amber-600', bg: 'bg-amber-50', icon: '📊' },
        ].map((stat) => (
          <div key={stat.label} className={`rounded-xl ${stat.bg} p-4 text-center animate-scale-in`}>
            <div className="text-lg mb-1">{stat.icon}</div>
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-xs font-medium text-slate-500 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Left Column: Roster + Availability */}
        <div className="flex flex-col gap-8">
          {/* Roster */}
          <section className="animate-slide-up">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Team Roster</h2>
            {validRoster.length === 0 ? (
              <EmptyState title="No members yet" icon="👥" />
            ) : (
              <div className="space-y-2">
                {validRoster.map((person) => (
                  <Link
                    key={person.personId}
                    to={`/people/${person.personId}`}
                    className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-violet-300 hover:shadow-md hover:shadow-violet-50"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 text-sm font-bold text-white shadow-lg shadow-violet-200">
                      {person.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 group-hover:text-violet-700 transition-colors">{person.name}</p>
                      <p className="text-xs text-slate-400">{person.title} · {person.role}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-16 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full ${(person.utilization ?? 0) > 80 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                          style={{ width: `${person.utilization ?? 0}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-slate-500 w-8 text-right">{person.utilization ?? 0}%</span>
                    </div>
                    {person.endDate && (
                      <span className="text-[10px] text-slate-400">left {person.endDate}</span>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Availability Grid */}
          <section className="animate-slide-up">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Availability Overview</h2>
            {validRoster.length === 0 ? (
              <EmptyState title="No availability data" icon="📊" />
            ) : (
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-2">
                {validRoster
                  .sort((a, b) => (a.utilization ?? 0) - (b.utilization ?? 0))
                  .map((person) => (
                    <UtilizationBar key={person.personId} pct={person.utilization ?? 0} name={person.name.split(' ')[0]} />
                  ))}
              </div>
            )}
          </section>
        </div>

        {/* Right Column: Skill Heatmap + Collab + Projects */}
        <div className="flex flex-col gap-8">
          {/* Skill Heatmap */}
          <section className="animate-slide-up">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Team Skill Coverage</h2>
            {compositionLoading ? (
              <LoadingSpinner label="Analyzing skills…" />
            ) : allSkills.length === 0 ? (
              <EmptyState title="No skill data available" icon="⚡" />
            ) : (
              <SkillHeatmap members={members} />
            )}
          </section>

          {/* Collaboration Patterns */}
          <section className="animate-slide-up">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Internal Collaboration</h2>
            {compositionLoading ? (
              <LoadingSpinner label="Analyzing collaborations…" />
            ) : (
              <CollabMatrix pairs={composition?.collaborationPairs} members={members} />
            )}
          </section>

          {/* Projects Delivered */}
          <section className="animate-slide-up">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Projects Delivered</h2>
            {validProjects.length === 0 ? (
              <EmptyState title="No projects yet" icon="📋" />
            ) : (
              <div className="space-y-2">
                {validProjects.map((project) => (
                  <Link
                    key={project.projectId}
                    to={`/projects/${project.projectId}`}
                    className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-brand-300 hover:shadow-sm"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-xs font-bold text-white shadow-md shadow-blue-200">
                      {project.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 group-hover:text-brand-600 transition-colors truncate">{project.name}</p>
                    </div>
                    <StatusBadge status={project.status} />
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
