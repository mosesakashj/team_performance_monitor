import { useState } from 'react';
import { Link } from 'react-router-dom';
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
        <EmptyState title="No data" icon="📊" />
      ) : (
        <UtilizationChart people={report} />
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
        {report.length > 0 && (
          <ExportButton
            data={report.map((r) => ({ skill: r.skill.name, category: r.skill.category, holders: r.holderCount }))}
            filename="skill-inventory"
          />
        )}
      </div>
      {report.length === 0 ? (
        <EmptyState title="No data" icon="⚡" />
      ) : (
        <SkillInventoryChart skills={report} />
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
        <EmptyState title="No data" icon="📁" />
      ) : (
        <ProjectHealthChart projects={report} />
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
        <EmptyState title="No endorsements" icon="⭐" />
      ) : (
        <EndorsementChart people={report} />
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
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
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