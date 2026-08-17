import { Link } from 'react-router-dom';
import { useStats } from '../hooks/useStats.js';
import { useProjectsList } from '../hooks/useProjects.js';
import { useTeamsList } from '../hooks/useTeams.js';
import { useSkillsList } from '../hooks/useSkills.js';
import { useEnrichedStats, useSkillDistribution, useTopBottlenecks, useGlobalSkillGaps, useActivityFeed } from '../hooks/useDashboardData.js';
import ErrorBanner from '../components/common/ErrorBanner.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import StatusBadge from '../components/common/StatusBadge.jsx';
import { SkeletonTile, SkeletonCard } from '../components/common/Skeleton.jsx';
import { SkillsDistributionChart, ProjectStatusChart, TeamUtilizationChart } from '../components/charts/DashboardCharts.jsx';

function StatTile({ label, value, icon, color = 'brand', trend }) {
  const colorMap = {
    brand: 'from-brand-500 to-brand-600',
    green: 'from-emerald-500 to-emerald-600',
    amber: 'from-amber-500 to-amber-600',
    slate: 'from-slate-500 to-slate-600',
    red: 'from-red-500 to-red-600',
  };

  return (
    <div className="stat-card group relative overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-br ${colorMap[color]} opacity-[0.03] transition-opacity group-hover:opacity-[0.06]`} />
      <div className="relative">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-medium text-slate-500">{label}</span>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition-colors group-hover:bg-brand-50 group-hover:text-brand-600">
            {icon}
          </span>
        </div>
        <p className="text-3xl font-bold tracking-tight text-slate-900">{value ?? '—'}</p>
        {trend && (
          <p className="mt-1 text-xs text-slate-400">{trend}</p>
        )}
      </div>
    </div>
  );
}

function QuickAction({ to, title, description, icon }) {
  return (
    <Link
      to={to}
      className="flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-brand-300 hover:shadow-md hover:shadow-brand-50"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        <p className="mt-0.5 text-xs text-slate-500 line-clamp-2">{description}</p>
      </div>
      <svg className="ml-auto h-5 w-5 shrink-0 text-slate-300" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
      </svg>
    </Link>
  );
}

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading, isError: statsError, refetch: refetchStats } = useStats();
  const {
    data: activeProjects,
    isLoading: projectsLoading,
    isError: projectsError,
    refetch: refetchProjects,
  } = useProjectsList({ status: 'active', limit: 6 });
  const { data: allProjects } = useProjectsList({ limit: 100 });
  const { data: teamsData } = useTeamsList();
  const { data: skillsData } = useSkillsList();
  const { data: enrichedStats } = useEnrichedStats();
  const { data: skillDist } = useSkillDistribution();
  const { data: bottlenecks } = useTopBottlenecks({ limit: 5 });
  const { data: skillGaps } = useGlobalSkillGaps();
  const { data: activityFeed } = useActivityFeed();

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 p-8 text-white">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold tracking-tight">Staffing overview</h1>
          <p className="mt-2 max-w-xl text-brand-100">
            Explore your people, skills, and projects as a connected graph — then find who can staff your next engagement.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/projects" className="inline-flex items-center gap-2 rounded-lg bg-white/20 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/30">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
              </svg>
              Browse projects
            </Link>
            <Link to="/connections" className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white/90 backdrop-blur-sm transition hover:bg-white/20">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
              </svg>
              Find connections
            </Link>
          </div>
        </div>
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/5" />
        <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-white/5" />
      </div>

      {/* Stats Grid */}
      {statsError ? (
        <ErrorBanner message="Couldn't load the overview numbers." onRetry={refetchStats} />
      ) : statsLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => <SkeletonTile key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <StatTile
            label="People"
            value={stats.peopleCount}
            color="brand"
            trend={`${stats.availableCount} available`}
            icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.25 0 015.25 0z" /></svg>}
          />
          <StatTile
            label="Active projects"
            value={stats.activeProjectCount}
            color="green"
            trend={`${stats.projectCount} total`}
            icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" /></svg>}
          />
          <StatTile
            label="Available"
            value={stats.availableCount}
            color="amber"
            icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          />
          <StatTile
            label="Teams"
            value={stats.teamCount}
            color="slate"
            icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" /></svg>}
          />
          <StatTile
            label="Skills"
            value={stats.skillCount}
            color="brand"
            icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>}
          />
        </div>
      )}

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        <ProjectStatusChart projects={allProjects?.projects ?? []} />
        <SkillsDistributionChart skills={skillsData?.skills ?? []} />
        <TeamUtilizationChart teams={teamsData?.teams ?? []} />
      </div>

      {/* Advanced Analytics Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Skill Demand vs Supply */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Skill Demand vs Supply</h3>
          {skillGaps?.gaps?.length > 0 ? (
            <div className="space-y-3">
              {skillGaps.gaps.slice(0, 5).map((gap) => (
                <div key={gap.skill.id} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <Link to={`/skills/${gap.skill.id}`} className="text-sm font-semibold text-slate-800 hover:text-brand-600 truncate block">
                      {gap.skill.name}
                    </Link>
                    <p className="text-[10px] text-slate-400">{gap.demandCount} projects need · {gap.supplyCount} have it</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className={`text-sm font-bold ${gap.ratio > 2 ? 'text-red-600' : gap.ratio > 1 ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {gap.ratio?.toFixed(1)}x
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No skill gaps detected" icon="✅" />
          )}
        </section>

        {/* Top Bottlenecks */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Top Bottleneck People</h3>
          {bottlenecks?.bottlenecks?.length > 0 ? (
            <div className="space-y-3">
              {bottlenecks.bottlenecks.map((b, i) => (
                <Link
                  key={b.person.id}
                  to={`/people/${b.person.id}`}
                  className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-slate-50"
                >
                  <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    i === 0 ? 'bg-amber-100 text-amber-700' :
                    i === 1 ? 'bg-slate-200 text-slate-600' :
                    'bg-slate-100 text-slate-500'
                  }`}>
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{b.person.name}</p>
                    <p className="text-[10px] text-slate-400">{b.projectCount} projects · {b.endorsementCount} endorsements</p>
                  </div>
                  <span className="text-sm font-bold text-brand-600">{b.score?.toFixed(1)}</span>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState title="No bottleneck data" icon="📊" />
          )}
        </section>

        {/* Activity Feed */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Recent Activity</h3>
          {activityFeed?.feed?.length > 0 ? (
            <div className="space-y-3">
              {activityFeed.feed.slice(0, 6).map((item, i) => (
                <div key={i} className="flex items-start gap-3 rounded-lg p-2">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100 text-[10px] font-bold text-amber-700">
                    ⭐
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-600">
                      <span className="font-semibold text-slate-800">{item.actor}</span>
                      {' endorsed '}
                      <span className="font-semibold text-slate-800">{item.target}</span>
                    </p>
                    {item.date && <p className="text-[10px] text-slate-400 mt-0.5">{item.date}</p>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No recent activity" icon="📋" />
          )}
        </section>
      </div>

      {/* Knowledge Transfer Alerts */}
      {enrichedStats?.avgUtilization && (
        <div className="rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Org Health Summary</h3>
              <p className="text-sm text-slate-600">
                Average utilization: <span className="font-bold text-amber-700">{enrichedStats.avgUtilization}%</span> ·
                Total endorsements: <span className="font-bold text-amber-700">{enrichedStats.totalEndorsements}</span> ·
                Completed projects: <span className="font-bold text-emerald-700">{enrichedStats.completedProjectCount}</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Two Column Layout */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Active Projects - 2 columns */}
        <div className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="section-heading">Active projects</h2>
            <Link to="/projects" className="btn-ghost text-brand-600 hover:text-brand-700">
              View all
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </Link>
          </div>

          {projectsError ? (
            <ErrorBanner message="Couldn't load active projects." onRetry={refetchProjects} />
          ) : projectsLoading ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : activeProjects.projects.length === 0 ? (
            <EmptyState title="No active projects" description="Once a project's status is set to active, it will show up here." icon="📋" />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {activeProjects.projects.map((project) => (
                <Link
                  key={project.id}
                  to={`/projects/${project.id}`}
                  className="group card-base relative overflow-hidden transition-all hover:border-brand-300 hover:shadow-md hover:shadow-brand-50"
                >
                  <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-brand-400 to-brand-600 opacity-0 transition-opacity group-hover:opacity-100" />
                  <div className="pl-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-slate-900 group-hover:text-brand-700 transition-colors">{project.name}</h3>
                      <StatusBadge status={project.status} />
                    </div>
                    <p className="mt-1 text-sm text-slate-500">{project.client_name}</p>
                    <div className="mt-3 flex items-center gap-3 text-xs text-slate-400">
                      {project.teamName && (
                        <span className="flex items-center gap-1">
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                          </svg>
                          {project.teamName}
                        </span>
                      )}
                      <span>Priority {project.priority}/5</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions - 1 column */}
        <div>
          <h2 className="mb-4 section-heading">Quick actions</h2>
          <div className="flex flex-col gap-3">
            <QuickAction
              to="/projects"
              title="Find staffing"
              description="Open a project to see recommended candidates ranked by skill match and availability."
              icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>}
            />
            <QuickAction
              to="/connections"
              title="Trace a connection"
              description="See how any two people are connected through shared projects, teams, or endorsements."
              icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" /></svg>}
            />
            <QuickAction
              to="/skills"
              title="Explore skills"
              description="Browse the skill catalog and discover how skills relate to each other."
              icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>}
            />
            <QuickAction
              to="/teams"
              title="Browse teams"
              description="View departments and the people and projects they deliver."
              icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3H21m-3.75 3H21" /></svg>}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
