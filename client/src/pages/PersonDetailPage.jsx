import { Link, useParams, useNavigate } from 'react-router-dom';
import { usePerson, usePersonNetwork } from '../hooks/usePeople.js';
import { usePersonTimeline } from '../hooks/useAnalytics.js';
import { useSkillRecommendations, useProjectRecommendations } from '../hooks/useRecommendations.js';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import ErrorBanner from '../components/common/ErrorBanner.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import StatusBadge from '../components/common/StatusBadge.jsx';
import NetworkGraph from '../components/graphs/NetworkGraph.jsx';
import UtilizationRing from '../components/person/UtilizationRing.jsx';
import SkillBar from '../components/person/SkillBar.jsx';
import TimelineItem from '../components/person/TimelineItem.jsx';

export default function PersonDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: person, isLoading, isError, refetch } = usePerson(id);
  const { data: networkData, isLoading: networkLoading } = usePersonNetwork(id);
  const { data: timeline } = usePersonTimeline(id);
  const { data: skillRecs } = useSkillRecommendations(id);
  const { data: projectRecs } = useProjectRecommendations(id);

  if (isError) return <div className="animate-fade-in"><ErrorBanner message="Couldn't load this person." onRetry={refetch} /></div>;
  if (isLoading) return <LoadingSpinner label="Loading profile…" />;

  const { person: profile, skills, projects, teams } = person;
  const validSkills = skills.filter((s) => s.skillId).sort((a, b) => b.proficiency - a.proficiency);
  const validProjects = projects.filter((p) => p.projectId);
  const validTeams = teams.filter((t) => t.teamId);
  const endorsements = timeline?.endorsements ?? [];
  const projectCount = validProjects.length;
  const teamCount = validTeams.length;
  const endorsementCount = endorsements.length;
  const avgProficiency = validSkills.length > 0 ? (validSkills.reduce((s, sk) => s + sk.proficiency, 0) / validSkills.length).toFixed(1) : '0';

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-white to-violet-50" />
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-brand-100/30 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-violet-100/30 blur-3xl" />
        <div className="relative p-8">
          <div className="flex flex-wrap items-start gap-8">
            <div className="relative">
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 text-2xl font-bold text-white shadow-xl shadow-brand-200">
                {profile.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
              </div>
              <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-md">
                {profile.current_utilization_pct < 100 ? (
                  <div className="h-3 w-3 rounded-full bg-emerald-500" />
                ) : (
                  <div className="h-3 w-3 rounded-full bg-amber-500" />
                )}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-slate-900">{profile.name}</h1>
                  <p className="text-lg text-slate-500 mt-1">{profile.title}</p>
                </div>
                {profile.current_utilization_pct < 100 ? (
                  <StatusBadge status="active" />
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-sm font-medium text-amber-700 border border-amber-200">
                    At capacity
                  </span>
                )}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {[
                  { icon: '📍', text: profile.location },
                  { icon: '🕐', text: profile.timezone },
                  { icon: '💼', text: profile.seniority },
                  { icon: '⏱️', text: `${profile.weekly_capacity_hours}h/week` },
                  { icon: '📅', text: `Free from ${profile.available_from}` },
                ].filter((p) => p.text).map((p, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 rounded-full bg-white/80 border border-slate-200 px-3 py-1 text-sm text-slate-600 shadow-sm">
                    <span>{p.icon}</span> {p.text}
                  </span>
                ))}
              </div>
            </div>
            <UtilizationRing pct={profile.current_utilization_pct} />
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Projects', value: projectCount, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Teams', value: teamCount, color: 'text-violet-600', bg: 'bg-violet-50' },
          { label: 'Skills', value: validSkills.length, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Endorsements', value: endorsementCount, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((stat) => (
          <div key={stat.label} className={`rounded-xl ${stat.bg} p-4 text-center animate-scale-in`}>
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-xs font-medium text-slate-500 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column: Skills + Teams */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          {/* Skills */}
          <section className="animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">Skills & Proficiency</h2>
              <span className="text-sm text-slate-400">Avg: {avgProficiency}/5</span>
            </div>
            {validSkills.length === 0 ? (
              <EmptyState title="No skills recorded" icon="⚡" />
            ) : (
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                {validSkills.map((skill) => (
                  <SkillBar key={skill.skillId} skill={skill} />
                ))}
              </div>
            )}
          </section>

          {/* Team Memberships */}
          <section className="animate-slide-up">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Team Memberships</h2>
            {validTeams.length === 0 ? (
              <EmptyState title="Not assigned to a team" icon="👥" />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {validTeams.map((team) => (
                  <Link
                    key={`${team.teamId}-${team.startDate}`}
                    to={`/teams/${team.teamId}`}
                    className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-violet-300 hover:shadow-md hover:shadow-violet-50"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 text-sm font-bold text-white shadow-lg shadow-violet-200">
                      {team.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-800 group-hover:text-violet-700 transition-colors">{team.name}</p>
                      <p className="text-xs text-slate-400">{team.role}{team.endDate ? ` · until ${team.endDate}` : ' · current'}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Network */}
          <section className="animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">Collaboration Network</h2>
              <Link to="/connections" className="text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors">
                Trace a connection →
              </Link>
            </div>
            {networkLoading ? (
              <LoadingSpinner label="Mapping collaborators…" />
            ) : networkData.colleagues.length === 0 ? (
              <EmptyState title="No shared-project collaborators yet" icon="🤝" />
            ) : (
              <>
                {/* Interactive Graph */}
                <NetworkGraph
                  nodes={[
                    { id: profile.id, name: profile.name, type: 'Person' },
                    ...networkData.colleagues.slice(0, 10).map((c) => ({
                      id: c.colleague.id, name: c.colleague.name, type: 'Person',
                    })),
                  ]}
                  edges={networkData.colleagues.slice(0, 10).flatMap((c) => [
                    { from: profile.id, to: c.colleague.id, label: `${c.sharedProjects} shared`, weight: c.sharedProjects },
                  ])}
                  centerNodeId={profile.id}
                  onNodeClick={(nodeId) => navigate(`/people/${nodeId}`)}
                  height={300}
                />
                {/* Compact List */}
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {networkData.colleagues.slice(0, 6).map((c) => {
                    const strength = Math.min(c.sharedProjects, 5);
                    const strengthColor = strength >= 4 ? 'bg-emerald-500' : strength >= 2 ? 'bg-blue-500' : 'bg-slate-300';
                    return (
                      <Link
                        key={c.colleague.id}
                        to={`/people/${c.colleague.id}`}
                        className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 transition-all hover:border-brand-300 hover:shadow-sm"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-600 text-xs font-bold text-white shadow-md shadow-brand-200">
                          {c.colleague.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-slate-800 group-hover:text-brand-600">{c.colleague.name}</p>
                          <p className="truncate text-xs text-slate-400">{c.colleague.title}</p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((i) => (
                              <div key={i} className={`h-2 w-2 rounded-full ${i <= strength ? strengthColor : 'bg-slate-200'}`} />
                            ))}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </>
            )}
          </section>

          {/* Skill Recommendations */}
          {skillRecs?.recommendations?.length > 0 && (
            <section className="animate-slide-up">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Suggested Skills</h2>
              <p className="mb-3 text-sm text-slate-500">Skills your collaborators have that you might want to learn.</p>
              <div className="flex flex-wrap gap-2">
                {skillRecs.recommendations.map((rec) => (
                  <Link
                    key={rec.skill.id}
                    to={`/skills/${rec.skill.id}`}
                    className="group inline-flex items-center gap-2 rounded-full border border-dashed border-amber-300 bg-amber-50 px-3 py-1.5 text-sm transition-all hover:border-amber-400 hover:bg-amber-100"
                  >
                    <span className="font-medium text-amber-700 group-hover:text-amber-800">{rec.skill.name}</span>
                    <span className="text-xs text-amber-500">{rec.howManyKnow} collaborators know this</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Project Recommendations */}
          {projectRecs?.recommendations?.length > 0 && (
            <section className="animate-slide-up">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Suggested Projects</h2>
              <p className="mb-3 text-sm text-slate-500">Projects that match your skills and availability.</p>
              <div className="space-y-2">
                {projectRecs.recommendations.map((rec) => (
                  <Link
                    key={rec.project.id}
                    to={`/projects/${rec.project.id}`}
                    className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-emerald-300 hover:shadow-sm"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-xs font-bold text-white shadow-md shadow-emerald-200">
                      {rec.project.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 group-hover:text-emerald-700 transition-colors truncate">{rec.project.name}</p>
                      <p className="text-xs text-slate-400">{rec.project.client_name} · {rec.project.status}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-emerald-600">{rec.matchedSkills} skills</div>
                      <div className="text-[10px] text-slate-400">matched</div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right Column: Timeline + Endorsements */}
        <div className="flex flex-col gap-8">
          {/* Endorsements */}
          <section className="animate-slide-up">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Endorsements</h2>
            {endorsements.length === 0 ? (
              <EmptyState title="No endorsements yet" icon="⭐" />
            ) : (
              <div className="space-y-3">
                {endorsements.slice(0, 5).map((e, i) => (
                  <div key={i} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                    <div className="flex items-center gap-2">
                      <Link to={`/people/${e.endorserId}`} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100 text-[10px] font-bold text-amber-700">
                        {e.endorser.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </Link>
                      <Link to={`/people/${e.endorserId}`} className="text-sm font-semibold text-slate-800 hover:text-brand-600">
                        {e.endorser}
                      </Link>
                    </div>
                    {e.note && <p className="mt-2 text-xs text-slate-500 italic leading-relaxed">"{e.note}"</p>}
                    {e.date && <p className="mt-1 text-[10px] text-slate-400">{e.date}</p>}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Career Timeline */}
          <section className="animate-slide-up">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Career Timeline</h2>
            {(!timeline?.projects?.length && !timeline?.teams?.length) ? (
              <EmptyState title="No timeline data" icon="📅" />
            ) : (
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                {[
                  ...timeline.projects.map((p) => ({ ...p, sortDate: p.startDate || '' })),
                  ...timeline.teams.map((t) => ({ ...t, sortDate: t.startDate || '' })),
                  ...endorsements.map((e) => ({ ...e, sortDate: e.date || '' })),
                ]
                  .sort((a, b) => (b.sortDate > a.sortDate ? 1 : -1))
                  .slice(0, 12)
                  .map((item, i, arr) => (
                    <TimelineItem key={`${item.type}-${item.name}-${i}`} item={item} isLast={i === arr.length - 1} />
                  ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
