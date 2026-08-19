import { useState } from 'react';
import {
  useUtilizationReport,
  useSkillInventoryReport,
  useProjectHealthReport,
  useEndorsementReport,
} from '../hooks/useReports.js';
import { ExportButton } from '../components/common/ExportButton.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import ErrorBanner from '../components/common/ErrorBanner.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import {
  UtilizationChart,
  SkillInventoryChart,
  ProjectHealthChart,
  EndorsementChart,
} from '../components/charts/ReportCharts.jsx';

const TABS = [
  {
    id: 'utilization',
    label: 'Utilization',
    description: 'Per-person allocation across projects',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    gradient: 'from-brand-500 to-indigo-600',
    accent: 'brand',
  },
  {
    id: 'skills',
    label: 'Skill Inventory',
    description: 'Top skills by holder count',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
      </svg>
    ),
    gradient: 'from-emerald-500 to-teal-600',
    accent: 'emerald',
  },
  {
    id: 'projects',
    label: 'Project Health',
    description: 'Staffing coverage per project',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
      </svg>
    ),
    gradient: 'from-amber-500 to-orange-600',
    accent: 'amber',
  },
  {
    id: 'endorsements',
    label: 'Endorsements',
    description: 'Peer recognition and ratings',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
      </svg>
    ),
    gradient: 'from-violet-500 to-purple-600',
    accent: 'violet',
  },
];

function StatCard({ label, value, sub, accent }) {
  const accentMap = {
    brand: { bg: 'bg-brand-50 dark:bg-brand-900/30', text: 'text-brand-600 dark:text-brand-400', ring: 'ring-brand-100 dark:ring-brand-800/50' },
    emerald: { bg: 'bg-emerald-50 dark:bg-emerald-900/30', text: 'text-emerald-600 dark:text-emerald-400', ring: 'ring-emerald-100 dark:ring-emerald-800/50' },
    amber: { bg: 'bg-amber-50 dark:bg-amber-900/30', text: 'text-amber-600 dark:text-amber-400', ring: 'ring-amber-100 dark:ring-amber-800/50' },
    violet: { bg: 'bg-violet-50 dark:bg-violet-900/30', text: 'text-violet-600 dark:text-violet-400', ring: 'ring-violet-100 dark:ring-violet-800/50' },
  };
  const a = accentMap[accent] || accentMap.brand;

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm animate-slide-up">
      <p className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${a.text}`}>{value}</p>
      {sub && <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">{sub}</p>}
    </div>
  );
}

function UtilizationReport() {
  const { data, isLoading, isError, refetch } = useUtilizationReport();
  if (isError) return <ErrorBanner message="Couldn't load utilization report." onRetry={refetch} />;
  if (isLoading) return <LoadingSpinner label="Loading utilization data..." />;
  const report = data?.report ?? [];

  const avgUtil = report.length > 0
    ? Math.round(report.reduce((sum, r) => sum + (r.utilization ?? 0), 0) / report.length)
    : 0;
  const overUtilized = report.filter((r) => (r.utilization ?? 0) > 90).length;
  const underUtilized = report.filter((r) => (r.utilization ?? 0) < 75).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total People" value={report.length} accent="brand" />
        <StatCard label="Avg Utilization" value={`${avgUtil}%`} sub="across all people" accent="brand" />
        <StatCard label="Over-allocated" value={overUtilized} sub="above 90%" accent="amber" />
        <StatCard label="Under-allocated" value={underUtilized} sub="below 75%" accent="emerald" />
      </div>
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Utilization Breakdown</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Current allocation per person</p>
          </div>
          {report.length > 0 && (
            <ExportButton
              data={report.map((r) => ({
                name: r.person.name,
                title: r.person.title,
                seniority: r.person.seniority,
                utilization: r.person.current_utilization_pct,
                team: r.team?.name ?? 'N/A',
              }))}
              filename="utilization-report"
            />
          )}
        </div>
        {report.length === 0 ? (
          <EmptyState title="No utilization data" description="Utilization data will appear here once people are assigned to projects." icon="📊" />
        ) : (
          <UtilizationChart people={report} />
        )}
      </div>
    </div>
  );
}

function SkillInventoryReport() {
  const { data, isLoading, isError, refetch } = useSkillInventoryReport();
  if (isError) return <ErrorBanner message="Couldn't load skill inventory." onRetry={refetch} />;
  if (isLoading) return <LoadingSpinner label="Loading skill inventory..." />;
  const report = data?.report ?? [];

  const categories = [...new Set(report.map((r) => r.skill.category).filter(Boolean))];
  const totalHolders = report.reduce((sum, r) => sum + (r.holderCount ?? 0), 0);
  const avgHolders = report.length > 0 ? Math.round(totalHolders / report.length) : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total Skills" value={report.length} accent="emerald" />
        <StatCard label="Categories" value={categories.length} accent="emerald" />
        <StatCard label="Avg Holders" value={avgHolders} sub="per skill" accent="brand" />
        <StatCard label="Total Holdings" value={totalHolders} sub="skill assignments" accent="violet" />
      </div>
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Top Skills by Holders</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Showing top 10 skills across the organization</p>
          </div>
          {report.length > 0 && (
            <ExportButton
              data={report.map((r) => ({ skill: r.skill.name, category: r.skill.category, holders: r.holderCount }))}
              filename="skill-inventory"
            />
          )}
        </div>
        {report.length === 0 ? (
          <EmptyState title="No skills data" description="Skill inventory data will appear once skills are assigned to people." icon="⚡" />
        ) : (
          <SkillInventoryChart skills={report} />
        )}
      </div>
    </div>
  );
}

function ProjectHealthReport() {
  const { data, isLoading, isError, refetch } = useProjectHealthReport();
  if (isError) return <ErrorBanner message="Couldn't load project health." onRetry={refetch} />;
  if (isLoading) return <LoadingSpinner label="Loading project health..." />;
  const report = data?.report ?? [];

  const avgCoverage = report.length > 0
    ? Math.round(report.reduce((sum, r) => sum + (r.coverageRatio ?? 0) * 100, 0) / report.length)
    : 0;
  const fullyStaffed = report.filter((r) => (r.coverageRatio ?? 0) >= 1).length;
  const understaffed = report.filter((r) => (r.coverageRatio ?? 0) < 0.75).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total Projects" value={report.length} accent="amber" />
        <StatCard label="Avg Coverage" value={`${avgCoverage}%`} sub="staffing ratio" accent="amber" />
        <StatCard label="Fully Staffed" value={fullyStaffed} sub="at or above 100%" accent="emerald" />
        <StatCard label="Understaffed" value={understaffed} sub="below 75%" accent="brand" />
      </div>
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Project Staffing Coverage</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Coverage ratio across active projects</p>
          </div>
          {report.length > 0 && (
            <ExportButton
              data={report.map((r) => ({
                name: r.project.name,
                status: r.project.status,
                coverage: `${(r.coverageRatio * 100).toFixed(0)}%`,
                staff: r.staff.length,
              }))}
              filename="project-health"
            />
          )}
        </div>
        {report.length === 0 ? (
          <EmptyState title="No project data" description="Project health data will appear once projects have staffing assignments." icon="📁" />
        ) : (
          <ProjectHealthChart projects={report} />
        )}
      </div>
    </div>
  );
}

function EndorsementReport() {
  const { data, isLoading, isError, refetch } = useEndorsementReport();
  if (isError) return <ErrorBanner message="Couldn't load endorsement report." onRetry={refetch} />;
  if (isLoading) return <LoadingSpinner label="Loading endorsements..." />;
  const report = data?.report ?? [];

  const totalEndorsements = report.reduce((sum, r) => sum + (r.endorsementCount ?? 0), 0);
  const avgRating = report.length > 0
    ? (report.reduce((sum, r) => sum + (r.avgRating ?? 0), 0) / report.length).toFixed(1)
    : '—';

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Endorsed People" value={report.length} accent="violet" />
        <StatCard label="Total Endorsements" value={totalEndorsements} accent="violet" />
        <StatCard label="Avg Rating" value={avgRating} sub="out of 5.0" accent="amber" />
        <StatCard label="Avg per Person" value={report.length > 0 ? (totalEndorsements / report.length).toFixed(1) : '—'} accent="brand" />
      </div>
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Top Endorsed People</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Top 8 people by peer endorsement count</p>
          </div>
          {report.length > 0 && (
            <ExportButton
              data={report.map((r) => ({
                name: r.person.name,
                endorsements: r.endorsementCount,
                avgRating: r.avgRating?.toFixed(1),
              }))}
              filename="endorsement-report"
            />
          )}
        </div>
        {report.length === 0 ? (
          <EmptyState title="No endorsements" description="Endorsement data will appear once people start endorsing each other." icon="⭐" />
        ) : (
          <EndorsementChart people={report} />
        )}
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('utilization');
  const active = TABS.find((t) => t.id === activeTab);

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 text-white">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          </div>
          <p className="mt-2 max-w-xl text-slate-300">
            Analyze workforce utilization, skill distribution, project health, and peer endorsements across your organization.
          </p>
        </div>
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/5" />
        <div className="absolute -bottom-8 -right-8 h-32 w-32 rounded-full bg-white/5" />
        <div className="absolute right-32 top-8 h-20 w-20 rounded-full bg-white/[0.03]" />
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 rounded-2xl bg-slate-100 dark:bg-slate-800 p-1.5">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-1 items-center justify-center gap-2.5 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-md shadow-slate-200/50 dark:shadow-slate-900/50'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-700/50'
            }`}
          >
            <span className={activeTab === tab.id ? 'text-brand-600 dark:text-brand-400' : ''}>{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Report Content */}
      {activeTab === 'utilization' && <UtilizationReport />}
      {activeTab === 'skills' && <SkillInventoryReport />}
      {activeTab === 'projects' && <ProjectHealthReport />}
      {activeTab === 'endorsements' && <EndorsementReport />}
    </div>
  );
}
