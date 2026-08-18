import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSimulatePersonRemoval } from '../hooks/useWhatIf.js';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import ErrorBanner from '../components/common/ErrorBanner.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import PersonPicker from '../components/person/PersonPicker.jsx';

export default function WhatIfPage() {
  const [selectedPersonId, setSelectedPersonId] = useState(null);
  const { data, isLoading, isError, refetch } = useSimulatePersonRemoval(selectedPersonId);

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div>
        <h1 className="page-heading">What-If Scenarios</h1>
        <p className="page-description">Simulate the impact of personnel changes on your organization.</p>
      </div>

      {/* Person Removal Simulation */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
        <h2 className="section-heading mb-4">Person Removal Impact</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Select a person to see what would happen if they left the organization.
        </p>
        <PersonPicker
          selected={selectedPersonId}
          onSelect={(person) => setSelectedPersonId(person?.id || null)}
          placeholder="Search for a person..."
        />

        {selectedPersonId && (
          <div className="mt-6">
            {isLoading ? (
              <LoadingSpinner label="Simulating impact..." />
            ) : isError ? (
              <ErrorBanner message="Failed to run simulation" onRetry={refetch} />
            ) : data ? (
              <div className="space-y-6">
                {/* Risk Score */}
                <div className={`rounded-xl p-4 ${
                  data.riskScore >= 30 ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800' :
                  data.riskScore >= 15 ? 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800' :
                  'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Risk Score</span>
                    <span className={`text-2xl font-bold ${
                      data.riskScore >= 30 ? 'text-red-600 dark:text-red-400' :
                      data.riskScore >= 15 ? 'text-amber-600 dark:text-amber-400' :
                      'text-emerald-600 dark:text-emerald-400'
                    }`}>
                      {data.riskScore}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {data.riskScore >= 30 ? 'High impact - critical knowledge loss' :
                     data.riskScore >= 15 ? 'Medium impact - some risk areas' :
                     'Low impact - well covered'}
                  </p>
                </div>

                {/* Affected Projects */}
                {data.affectedProjects.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                      Affected Projects ({data.affectedProjects.length})
                    </h3>
                    <div className="space-y-2">
                      {data.affectedProjects.map((p) => (
                        <Link
                          key={p.project.id}
                          to={`/projects/${p.project.id}`}
                          className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-700 p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                        >
                          <div>
                            <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{p.project.name}</p>
                            <p className="text-xs text-slate-400 dark:text-slate-500">
                              {p.remainingCount} remaining staff: {p.remainingStaff.join(', ') || 'None'}
                            </p>
                          </div>
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                            p.riskLevel === 'critical' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                            p.riskLevel === 'at-risk' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' :
                            'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                          }`}>
                            {p.riskLevel}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Knowledge Silos */}
                {data.knowledgeSilos.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                      Knowledge Silos ({data.knowledgeSilos.length} unique skills)
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {data.knowledgeSilos.map((s) => (
                        <span key={s.skill.id} className="inline-flex items-center gap-1 rounded-full bg-red-100 dark:bg-red-900/30 px-3 py-1 text-xs font-medium text-red-700 dark:text-red-400">
                          {s.skill.name}
                          <span className="text-red-400 dark:text-red-500">({s.skill.category})</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {data.affectedProjects.length === 0 && data.knowledgeSilos.length === 0 && (
                  <EmptyState title="No significant impact" description="This person's departure would have minimal impact." icon="✅" />
                )}
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
