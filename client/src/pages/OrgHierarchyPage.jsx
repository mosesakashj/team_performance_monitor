import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useOrgHierarchy } from '../hooks/useHierarchy.js';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import ErrorBanner from '../components/common/ErrorBanner.jsx';
import EmptyState from '../components/common/EmptyState.jsx';

function ManagerNode({ person, reports, byManager, level = 0 }) {
  const [expanded, setExpanded] = useState(true);
  const hasReports = reports && reports.length > 0;

  return (
    <div className={`${level > 0 ? 'ml-8 border-l-2 border-slate-100 pl-6' : ''}`}>
      <div className="flex items-center gap-4 py-3">
        <button
          onClick={() => hasReports && setExpanded(!expanded)}
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
            hasReports
              ? 'bg-brand-50 text-brand-600 hover:bg-brand-100 cursor-pointer'
              : 'bg-slate-50 text-slate-300 cursor-default'
          } transition-colors`}
        >
          {hasReports ? (
            <svg
              className={`h-4 w-4 transition-transform ${expanded ? 'rotate-90' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          ) : (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          )}
        </button>
        <Link
          to={`/people/${person.id}`}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-600 text-sm font-bold text-white shadow-md shadow-brand-200 hover:shadow-lg transition-shadow"
        >
          {person.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
        </Link>
        <div className="min-w-0 flex-1">
          <Link to={`/people/${person.id}`} className="font-semibold text-slate-900 hover:text-brand-600 transition-colors truncate block">
            {person.name}
          </Link>
          <p className="text-sm text-slate-500 truncate">{person.title}</p>
        </div>
        {hasReports && (
          <span className="shrink-0 rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
            {reports.length} direct report{reports.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>
      {expanded && hasReports && (
        <div className="animate-slide-down">
          {reports.map((report) => (
            <ManagerNode
              key={report.id}
              person={report}
              reports={byManager[report.id]?.reports || []}
              byManager={byManager}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function OrgHierarchyPage() {
  const { data, isLoading, isError, refetch } = useOrgHierarchy();

  if (isError) return <div className="animate-fade-in"><ErrorBanner message="Couldn't load org hierarchy." onRetry={refetch} /></div>;
  if (isLoading) return <LoadingSpinner label="Loading org hierarchy…" />;
  if (!data || !data.employees?.length) {
    return (
      <div className="animate-fade-in">
        <EmptyState
          title="No hierarchy data"
          description="No manager-report relationships found in the database."
          icon={<svg className="h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" /></svg>}
        />
      </div>
    );
  }

  const { topLevel, byManager } = data;

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Organization Hierarchy</h1>
        <p className="mt-1 text-slate-500">Visualize the manager-report structure across the organization.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50">
            <svg className="h-5 w-5 text-brand-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
            </svg>
          </div>
          <div>
            <h2 className="font-semibold text-slate-900">Top-Level Managers</h2>
            <p className="text-sm text-slate-500">{topLevel.length} root director{topLevel.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <div className="divide-y divide-slate-100">
          {topLevel.map((person) => (
            <ManagerNode
              key={person.id}
              person={person}
              reports={byManager[person.id]?.reports || []}
              byManager={byManager}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
