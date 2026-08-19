import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useProject, useProjectCandidates } from '../hooks/useProjects.js';
import { useProjectSkillGaps } from '../hooks/useAnalytics.js';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import ErrorBanner from '../components/common/ErrorBanner.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import StatusBadge from '../components/common/StatusBadge.jsx';
import { SkeletonTable, SkeletonCard } from '../components/common/Skeleton.jsx';

function PriorityStars({ priority, max = 5 }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }, (_, i) => (
        <svg key={i} className={`h-4 w-4 ${i < priority ? 'text-amber-400' : 'text-slate-300 dark:text-slate-600'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

const STATUS_GRADIENTS = {
  active: 'from-blue-500 to-indigo-600',
  completed: 'from-emerald-500 to-teal-600',
  proposed: 'from-slate-400 to-slate-500',
  on_hold: 'from-amber-500 to-orange-600',
};

const STATUS_BG = {
  active: 'from-blue-500/10 to-indigo-500/10',
  completed: 'from-emerald-500/10 to-teal-500/10',
  proposed: 'from-slate-400/10 to-slate-500/10',
  on_hold: 'from-amber-500/10 to-orange-500/10',
};

function StatTile({ label, value, sub, icon, color = 'brand' }) {
  const colorMap = {
    brand: 'bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400',
    emerald: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
    amber: 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
    violet: 'bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400',
    slate: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400',
  };

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${colorMap[color]}`}>
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">{label}</p>
          <p className={`text-xl font-bold ${colorMap[color].split(' ').pop()}`}>{value}</p>
          {sub && <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">{sub}</p>}
        </div>
      </div>
    </div>
  );
}

function GanttTimeline({ startDate, endDate, status }) {
  if (!startDate || !endDate) return null;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const now = new Date();
  const totalDays = (end - start) / (1000 * 60 * 60 * 24);
  const elapsedDays = Math.max(0, Math.min(totalDays, (now - start) / (1000 * 60 * 60 * 24)));
  const progress = totalDays > 0 ? Math.min(100, (elapsedDays / totalDays) * 100) : 0;
  const remaining = Math.max(0, totalDays - elapsedDays);

  const formatDate = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Project Timeline</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">{Math.round(totalDays)} days total · {Math.round(remaining)} days remaining</p>
        </div>
        <span className={`text-sm font-bold bg-gradient-to-r ${STATUS_GRADIENTS[status] || STATUS_GRADIENTS.proposed} bg-clip-text text-transparent`}>
          {Math.round(progress)}%
        </span>
      </div>

      {/* Timeline bar */}
      <div className="relative">
        {/* Month markers */}
        <div className="flex justify-between mb-2">
          <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">{formatDate(start)}</span>
          <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">{formatDate(end)}</span>
        </div>

        {/* Progress track */}
        <div className="relative h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
          <div
            className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${STATUS_GRADIENTS[status] || STATUS_GRADIENTS.proposed} transition-all duration-1000 ease-out`}
            style={{ width: `${progress}%` }}
          />
          {/* Glow effect */}
          <div
            className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${STATUS_GRADIENTS[status] || STATUS_GRADIENTS.proposed} opacity-40 blur-sm transition-all duration-1000`}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Today marker */}
        {progress > 0 && progress < 100 && (
          <div className="absolute top-6 -mt-1" style={{ left: `calc(${progress}% - 4px)` }}>
            <div className="h-2 w-2 rounded-full bg-white border-2 border-slate-900 dark:border-white shadow" />
          </div>
        )}
      </div>

      {/* Milestones */}
      <div className="mt-4 flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-emerald-500" />
          <span>Start</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-slate-900 dark:bg-white border-2 border-white dark:border-slate-800 shadow" />
          <span>Today</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-600" />
          <span>End</span>
        </div>
      </div>
    </div>
  );
}

function SkillGapCard({ gap }) {
  const isCovered = gap.coverageCount > 0;
  return (
    <div className={`rounded-xl border p-4 transition-all hover:shadow-sm ${
      isCovered
        ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-900/10'
        : 'border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10'
    }`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link to={`/skills/${gap.id}`} className="font-semibold text-slate-800 dark:text-slate-200 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
            {gap.name}
          </Link>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center rounded-md bg-white dark:bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
              {gap.category}
            </span>
            <span className="inline-flex items-center rounded-md bg-white dark:bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
              Level {gap.min_proficiency}
            </span>
            <span className="inline-flex items-center rounded-md bg-white dark:bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
              {gap.seniority_needed}
            </span>
          </div>
        </div>
        {isCovered ? (
          <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-900/40 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
            Covered
          </span>
        ) : (
          <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-900/40 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400">
            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
            Gap
          </span>
        )}
      </div>
      {isCovered && gap.coveredBy?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {gap.coveredBy.slice(0, 4).map((c, i) => (
            <Link
              key={i}
              to={`/people/${c.personId}`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-white dark:bg-slate-800 px-2.5 py-1 text-[11px] font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-brand-300 dark:hover:border-brand-500 transition-colors"
            >
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900/40 text-[8px] font-bold text-brand-600 dark:text-brand-400">
                {c.name.split(' ').map((n) => n[0]).join('').slice(0, 1)}
              </span>
              {c.name}
              <span className="text-slate-400 dark:text-slate-500">· L{c.proficiency}</span>
            </Link>
          ))}
          {gap.coveredBy.length > 4 && (
            <span className="inline-flex items-center rounded-lg bg-white dark:bg-slate-800 px-2.5 py-1 text-[11px] font-medium text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700">
              +{gap.coveredBy.length - 4} more
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function CandidateCard({ candidate, rank }) {
  const rankStyles = [
    'border-amber-300 dark:border-amber-600 bg-gradient-to-br from-amber-50 to-white dark:from-amber-900/20 dark:to-slate-800 shadow-md shadow-amber-100 dark:shadow-amber-900/20',
    'border-slate-300 dark:border-slate-600 bg-gradient-to-br from-slate-50 to-white dark:from-slate-700/50 dark:to-slate-800 shadow-md shadow-slate-100 dark:shadow-slate-900/20',
    'border-orange-300 dark:border-orange-600 bg-gradient-to-br from-orange-50 to-white dark:from-orange-900/20 dark:to-slate-800 shadow-md shadow-orange-100 dark:shadow-orange-900/20',
  ];
  const rankBadge = [
    'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 ring-2 ring-amber-200 dark:ring-amber-700',
    'bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300',
    'bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-400',
  ];

  return (
    <div className={`rounded-2xl border-2 p-5 shadow-md transition-all hover:shadow-xl animate-scale-in ${rankStyles[rank] || 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'}`}>
      <div className="flex items-start gap-4">
        <div className="relative">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 text-lg font-bold text-white shadow-lg shadow-brand-200 dark:shadow-brand-900/40">
            {candidate.person.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
          </div>
          {rank < 3 && (
            <div className={`absolute -top-2 -left-2 flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold shadow-sm ${rankBadge[rank]}`}>
              #{rank + 1}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <Link to={`/people/${candidate.person.id}`} className="text-base font-bold text-slate-900 dark:text-slate-100 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
            {candidate.person.name}
          </Link>
          <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{candidate.person.title}</p>
          <p className="text-xs text-slate-400 dark:text-slate-500">{candidate.person.seniority}</p>
        </div>
        <div className="text-right shrink-0">
          <div className="text-2xl font-bold bg-gradient-to-r from-brand-600 to-indigo-600 dark:from-brand-400 dark:to-indigo-400 bg-clip-text text-transparent">
            {candidate.totalScore?.toFixed(1)}
          </div>
          <div className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">score</div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="rounded-xl bg-slate-50 dark:bg-slate-700/50 p-2.5 text-center">
          <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{candidate.matchedSkills}</div>
          <div className="text-[10px] font-medium text-slate-400 dark:text-slate-500">skills</div>
        </div>
        <div className="rounded-xl bg-slate-50 dark:bg-slate-700/50 p-2.5 text-center">
          <div className="text-lg font-bold text-violet-600 dark:text-violet-400">{candidate.avgProficiency?.toFixed(1)}</div>
          <div className="text-[10px] font-medium text-slate-400 dark:text-slate-500">proficiency</div>
        </div>
        <div className="rounded-xl bg-slate-50 dark:bg-slate-700/50 p-2.5 text-center">
          <div className={`text-lg font-bold ${candidate.teamFitBonus > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-300 dark:text-slate-600'}`}>{candidate.teamFitBonus}</div>
          <div className="text-[10px] font-medium text-slate-400 dark:text-slate-500">connections</div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${candidate.person.current_utilization_pct > 90 ? 'bg-red-500' : candidate.person.current_utilization_pct > 75 ? 'bg-amber-500' : 'bg-emerald-500'}`} />
          <span className="text-xs text-slate-500 dark:text-slate-400">{candidate.person.current_utilization_pct}% utilized</span>
        </div>
        {candidate.teamFitBonus > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.25 0 015.25 0z" />
            </svg>
            Knows {candidate.teamFitBonus} colleague{candidate.teamFitBonus === 1 ? '' : 's'}
          </span>
        )}
      </div>
    </div>
  );
}

function OverviewTab({ project, teamName, validStaff, validSkills }) {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Description */}
      {project.description && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">About this project</h3>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">{project.description}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile
          label="Staff"
          value={validStaff.length}
          sub={`${validStaff.reduce((s, p) => s + (p.allocationPct || 0), 0)}% total allocation`}
          color="brand"
          icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.25 0 015.25 0z" /></svg>}
        />
        <StatTile
          label="Required Skills"
          value={validSkills.length}
          sub="distinct skills needed"
          color="violet"
          icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>}
        />
        <StatTile
          label="Priority"
          value={`${project.priority}/5`}
          sub={project.priority >= 4 ? 'High priority' : project.priority >= 2 ? 'Medium' : 'Low'}
          color={project.priority >= 4 ? 'amber' : project.priority >= 2 ? 'brand' : 'slate'}
          icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" /></svg>}
        />
        <StatTile
          label="Budget"
          value={project.budget ? `$${project.budget.toLocaleString('en-US')}` : '—'}
          sub={project.budget ? 'allocated budget' : 'not set'}
          color="emerald"
          icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
      </div>

      {/* Quick Staff Preview */}
      {validStaff.length > 0 && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4">Current Team</h3>
          <div className="flex flex-wrap gap-3">
            {validStaff.map((person) => (
              <Link
                key={person.personId}
                to={`/people/${person.personId}`}
                className="group flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 px-3 py-2 transition-all hover:border-brand-300 dark:hover:border-brand-500 hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-600 text-xs font-bold text-white shadow-sm">
                  {person.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors truncate">{person.name}</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">{person.role} · {person.allocationPct}%</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SkillsStaffTab({ validSkills, skillGaps, validStaff }) {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Skill Coverage */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Skill Coverage Analysis</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {skillGaps?.gaps?.length ?? 0} skills analyzed · {' '}
              {skillGaps?.gaps?.filter((g) => g.coverageCount > 0).length ?? 0} fully covered
            </p>
          </div>
        </div>
        {skillGaps?.gaps?.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {skillGaps.gaps.map((gap) => (
              <SkillGapCard key={gap.id} gap={gap} />
            ))}
          </div>
        ) : validSkills.length > 0 ? (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm">
            <div className="flex flex-wrap gap-2">
              {validSkills.map((skill) => (
                <Link
                  key={skill.skillId}
                  to={`/skills/${skill.skillId}`}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 px-3 py-2 text-sm transition-all hover:border-brand-300 dark:hover:border-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20"
                >
                  <span className="font-medium text-slate-700 dark:text-slate-300">{skill.name}</span>
                  <span className="text-xs text-slate-400 dark:text-slate-500">L{skill.minProficiency}</span>
                  <span className="inline-flex items-center rounded-md bg-slate-200 dark:bg-slate-600 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 dark:text-slate-400">
                    {skill.seniorityNeeded}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <EmptyState title="No skill requirements set" icon="⚡" />
        )}
      </section>

      {/* Current Staff */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Assigned Staff</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">{validStaff.length} team member{validStaff.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        {validStaff.length === 0 ? (
          <EmptyState
            title="No one staffed yet"
            description="Check the recommended candidates below to find the right people."
            icon="👥"
          />
        ) : (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 divide-y divide-slate-100 dark:divide-slate-700 shadow-sm">
            {validStaff.map((person) => (
              <Link
                key={person.personId}
                to={`/people/${person.personId}`}
                className="group flex items-center gap-4 p-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 text-sm font-bold text-white shadow-md shadow-brand-200 dark:shadow-brand-900/30">
                  {person.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">{person.name}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 capitalize">{person.role}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm font-bold text-slate-700 dark:text-slate-300">{person.allocationPct}%</div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500">allocation</div>
                  </div>
                  <div className="relative h-10 w-10">
                    <svg className="h-10 w-10 -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="14" fill="none" stroke="currentColor" strokeWidth="3" className="text-slate-100 dark:text-slate-700" />
                      <circle cx="18" cy="18" r="14" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray={`${person.allocationPct * 0.88} 88`} strokeLinecap="round" className="text-brand-500 dark:text-brand-400" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function CandidatesTab({ candidatesData, candidatesLoading, candidatesError, refetchCandidates }) {
  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Recommended Candidates</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Ranked by matching & closely related skills, availability, and prior collaboration with people already on this project.
        </p>
      </div>
      {candidatesError ? (
        <ErrorBanner message="Couldn't load candidate recommendations." onRetry={refetchCandidates} />
      ) : candidatesLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : candidatesData.candidates.length === 0 ? (
        <EmptyState
          title="No candidates found"
          description="No one available right now matches this project's required or related skills."
          icon="🔍"
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {candidatesData.candidates.map((c, index) => (
            <CandidateCard key={c.person.id} candidate={c} rank={index} />
          ))}
        </div>
      )}
    </div>
  );
}

const TABS = [
  { id: 'overview', label: 'Overview', icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg> },
  { id: 'skills-staff', label: 'Skills & Staff', icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" /></svg> },
  { id: 'candidates', label: 'Candidates', icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg> },
  { id: 'timeline', label: 'Timeline', icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg> },
];

export default function ProjectDetailPage() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('overview');
  const { data, isLoading, isError, refetch } = useProject(id);
  const { data: candidatesData, isLoading: candidatesLoading, isError: candidatesError, refetch: refetchCandidates } = useProjectCandidates(id);
  const { data: skillGaps } = useProjectSkillGaps(id);

  if (isError) return <div className="animate-fade-in"><ErrorBanner message="Couldn't load this project." onRetry={refetch} /></div>;
  if (isLoading) return <LoadingSpinner label="Loading project..." />;

  const { project, requiredSkills, staff, teamName } = data;
  const validSkills = requiredSkills.filter((s) => s.skillId);
  const validStaff = staff.filter((s) => s.personId);

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-8 text-white">
        <div className="relative z-10">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-3">
                <StatusBadge status={project.status} className="!bg-white/15 !text-white !border-white/20 !backdrop-blur-sm" />
                <PriorityStars priority={project.priority} />
              </div>
              <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
              <p className="mt-1 text-lg text-slate-300">{project.client_name}</p>
            </div>
            {project.budget && (
              <div className="rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 px-6 py-4 text-right">
                <div className="text-3xl font-bold">${project.budget?.toLocaleString('en-US')}</div>
                <div className="text-xs font-medium text-slate-300 mt-0.5">budget</div>
              </div>
            )}
          </div>

          {/* Metadata chips */}
          <div className="mt-6 flex flex-wrap gap-2">
            {teamName && (
              <span className="inline-flex items-center gap-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 px-3.5 py-1.5 text-sm text-white/90">
                <svg className="h-4 w-4 text-white/60" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
                {teamName}
              </span>
            )}
            {project.start_date && (
              <span className="inline-flex items-center gap-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 px-3.5 py-1.5 text-sm text-white/90">
                <svg className="h-4 w-4 text-white/60" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
                {project.start_date} → {project.end_date}
              </span>
            )}
            <span className="inline-flex items-center gap-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 px-3.5 py-1.5 text-sm text-white/90">
              <svg className="h-4 w-4 text-white/60" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" />
              </svg>
              Priority {project.priority}/5
            </span>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/5" />
        <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-white/5" />
        <div className="absolute right-40 top-8 h-24 w-24 rounded-full bg-indigo-500/10" />
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 rounded-2xl bg-slate-100 dark:bg-slate-800 p-1.5">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
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

      {/* Tab Content */}
      {activeTab === 'overview' && <OverviewTab project={project} teamName={teamName} validStaff={validStaff} validSkills={validSkills} />}
      {activeTab === 'skills-staff' && <SkillsStaffTab validSkills={validSkills} skillGaps={skillGaps} validStaff={validStaff} />}
      {activeTab === 'candidates' && <CandidatesTab candidatesData={candidatesData} candidatesLoading={candidatesLoading} candidatesError={candidatesError} refetchCandidates={refetchCandidates} />}
      {activeTab === 'timeline' && <GanttTimeline startDate={project.start_date} endDate={project.end_date} status={project.status} />}
    </div>
  );
}
