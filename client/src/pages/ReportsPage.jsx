import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useUtilizationReport, useSkillInventoryReport, useProjectHealthReport, useEndorsementReport } from '../hooks/useReports.js';
import { ExportButton } from '../components/common/ExportButton.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import ErrorBanner from '../components/common/ErrorBanner.jsx';
import EmptyState from '../components/common/EmptyState.jsx';

const TABS = [
  { id: 'utilization', label: 'Utilization' },
  { id: 'skills', label: 'Skill Inventory' },
  { id: 'projects', label: 'Project Health' },
  { id: 'endorsements', label: 'Endorsements' },
];

function UtilizationReport() {
  const { data, isLoading, isError, refetch } = useUtilizationReport();
  if (isError) return <ErrorBanner message="Couldn't load utilization report." onRetry={refetch} />;
  if (isLoading) return <LoadingSpinner label="Loading report..." />;
  const report = data?.report ?? [];
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{report.length} people</p>
        {report.length > 0 && <ExportButton data={report.map((r) => ({ name: r.person.name, title: r.person.title, seniority: r.person.seniority, utilization: r.person.current_utilization_pct, team: r.team?.name ?? 'N/A' }))} filename="utilization-report" />}
      </div>
      {report.length === 0 ? <EmptyState title="No data" icon="📊" /> : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Person</th>
                <th className="px-4 py-3 font-medium">Team</th>
                <th className="px-4 py-3 font-medium">Seniority</th>
                <th className="px-4 py-3 font-medium">Utilization</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {report.map((row) => (
                <tr key={row.person.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3"><Link to={`/people/${row.person.id}`} className="font-medium text-slate-800 hover:text-brand-600">{row.person.name}</Link><p className="text-xs text-slate-400">{row.person.title}</p></td>
                  <td className="px-4 py-3 text-slate-600">{row.team?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-600 capitalize">{row.person.seniority}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-100">
                        <div className={`h-full rounded-full ${row.person.current_utilization_pct > 80 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(100, row.person.current_utilization_pct)}%` }} />
                      </div>
                      <span className="text-xs font-medium text-slate-600">{row.person.current_utilization_pct}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function SkillInventoryReport() {
  const { data, isLoading, isError, refetch } = useSkillInventoryReport();
  if (isError) return <ErrorBanner message="Couldn't load skill inventory." onRetry={refetch} />;
  if (isLoading) return <LoadingSpinner label="Loading report..." />;
  const report = data?.report ?? [];
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{report.length} skills</p>
        {report.length > 0 && <ExportButton data={report.map((r) => ({ skill: r.skill.name, category: r.skill.category, holders: r.holderCount }))} filename="skill-inventory" />}
      </div>
      {report.length === 0 ? <EmptyState title="No data" icon="⚡" /> : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {report.map((row) => (
            <div key={row.skill.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <Link to={`/skills/${row.skill.id}`} className="font-semibold text-slate-900 hover:text-brand-600">{row.skill.name}</Link>
              <p className="text-xs text-slate-400 mt-0.5">{row.skill.category}</p>
              <p className="mt-2 text-sm text-slate-600">{row.holderCount} holder{row.holderCount !== 1 ? 's' : ''}</p>
              {row.holders?.slice(0, 3).map((h, i) => (
                <p key={i} className="text-xs text-slate-500 mt-1">{h.name} · L{h.proficiency} · {h.years}yr</p>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ProjectHealthReport() {
  const { data, isLoading, isError, refetch } = useProjectHealthReport();
  if (isError) return <ErrorBanner message="Couldn't load project health." onRetry={refetch} />;
  if (isLoading) return <LoadingSpinner label="Loading report..." />;
  const report = data?.report ?? [];
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{report.length} projects</p>
        {report.length > 0 && <ExportButton data={report.map((r) => ({ name: r.project.name, status: r.project.status, coverage: `${(r.coverageRatio * 100).toFixed(0)}%`, staff: r.staff.length }))} filename="project-health" />}
      </div>
      {report.length === 0 ? <EmptyState title="No data" icon="📁" /> : (
        <div className="space-y-3">
          {report.map((row) => (
            <div key={row.project.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <Link to={`/projects/${row.project.id}`} className="font-semibold text-slate-900 hover:text-brand-600">{row.project.name}</Link>
                  <p className="text-xs text-slate-400">{row.project.client_name} · {row.project.status}</p>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${row.coverageRatio >= 0.8 ? 'text-emerald-600' : row.coverageRatio >= 0.5 ? 'text-amber-600' : 'text-red-600'}`}>
                    {(row.coverageRatio * 100).toFixed(0)}%
                  </div>
                  <div className="text-[10px] text-slate-400">skill coverage</div>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {row.coveredSkills?.slice(0, 5).map((s, i) => <span key={i} className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">{s}</span>)}
                {row.requiredSkills?.filter((s) => !row.coveredSkills?.includes(s)).slice(0, 3).map((s, i) => <span key={i} className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-medium text-red-600">{s}</span>)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EndorsementReport() {
  const { data, isLoading, isError, refetch } = useEndorsementReport();
  if (isError) return <ErrorBanner message="Couldn't load endorsement report." onRetry={refetch} />;
  if (isLoading) return <LoadingSpinner label="Loading report..." />;
  const report = data?.report ?? [];
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{report.length} endorsed people</p>
        {report.length > 0 && <ExportButton data={report.map((r) => ({ name: r.person.name, endorsements: r.endorsementCount, avgRating: r.avgRating?.toFixed(1) }))} filename="endorsement-report" />}
      </div>
      {report.length === 0 ? <EmptyState title="No endorsements" icon="⭐" /> : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {report.map((row) => (
            <div key={row.person.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <Link to={`/people/${row.person.id}`} className="font-semibold text-slate-900 hover:text-brand-600">{row.person.name}</Link>
              <p className="text-xs text-slate-400">{row.person.title}</p>
              <div className="mt-2 flex items-center gap-3 text-sm">
                <span className="text-slate-600">{row.endorsementCount} endorsements</span>
                <span className="text-amber-600 font-medium">{row.avgRating?.toFixed(1)} avg</span>
              </div>
              {row.skills?.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {row.skills.slice(0, 4).map((s, i) => <span key={i} className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600">{s}</span>)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('utilization');
  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div>
        <h1 className="page-heading">Reports</h1>
        <p className="page-description">View utilization, skill inventory, project health, and endorsement reports.</p>
      </div>
      <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
        {TABS.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            {tab.label}
          </button>
        ))}
      </div>
      {activeTab === 'utilization' && <UtilizationReport />}
      {activeTab === 'skills' && <SkillInventoryReport />}
      {activeTab === 'projects' && <ProjectHealthReport />}
      {activeTab === 'endorsements' && <EndorsementReport />}
    </div>
  );
}
