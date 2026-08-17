const CATEGORY_COLORS = {
  Language: { bg: 'bg-blue-500', light: 'bg-blue-100', text: 'text-blue-700' },
  Framework: { bg: 'bg-violet-500', light: 'bg-violet-100', text: 'text-violet-700' },
  Cloud: { bg: 'bg-cyan-500', light: 'bg-cyan-100', text: 'text-cyan-700' },
  Data: { bg: 'bg-amber-500', light: 'bg-amber-100', text: 'text-amber-700' },
  'Soft Skill': { bg: 'bg-emerald-500', light: 'bg-emerald-100', text: 'text-emerald-700' },
  Domain: { bg: 'bg-rose-500', light: 'bg-rose-100', text: 'text-rose-700' },
};

const STATUS_COLORS = {
  active: { bg: '#10b981', label: 'Active' },
  proposed: { bg: '#3568f7', label: 'Proposed' },
  on_hold: { bg: '#f59e0b', label: 'On Hold' },
  completed: { bg: '#94a3b8', label: 'Completed' },
};

export function SkillsDistributionChart({ skills }) {
  if (!skills || skills.length === 0) return null;

  const categoryCounts = {};
  skills.forEach((s) => {
    categoryCounts[s.category] = (categoryCounts[s.category] || 0) + 1;
  });

  const sorted = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const maxCount = Math.max(...sorted.map(([, count]) => count));

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="section-heading mb-1">Skills by category</h3>
      <p className="mb-5 text-xs text-slate-400">{skills.length} skills tracked</p>
      <div className="space-y-3">
        {sorted.map(([category, count]) => {
          const colors = CATEGORY_COLORS[category] || { bg: 'bg-slate-500', light: 'bg-slate-100', text: 'text-slate-700' };
          const pct = (count / maxCount) * 100;
          return (
            <div key={category}>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700">{category}</span>
                <span className="text-slate-500">{count}</span>
              </div>
              <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full ${colors.bg} transition-all duration-500`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ProjectStatusChart({ projects }) {
  if (!projects || projects.length === 0) return null;

  const statusCounts = {};
  projects.forEach((p) => {
    statusCounts[p.status] = (statusCounts[p.status] || 0) + 1;
  });

  const total = projects.length;
  const entries = Object.entries(statusCounts).sort((a, b) => b[1] - a[1]);

  // Build donut segments
  let accumulated = 0;
  const segments = entries.map(([status, count]) => {
    const pct = (count / total) * 100;
    const dashArray = `${pct} ${100 - pct}`;
    const dashOffset = -accumulated;
    accumulated += pct;
    return { status, count, pct, dashArray, dashOffset, color: STATUS_COLORS[status]?.bg || '#94a3b8', label: STATUS_COLORS[status]?.label || status };
  });

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="section-heading mb-1">Project status</h3>
      <p className="mb-5 text-xs text-slate-400">{total} projects total</p>
      <div className="flex items-center gap-6">
        {/* Donut */}
        <div className="relative h-32 w-32 shrink-0">
          <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
            <circle cx="18" cy="18" r="14" fill="none" stroke="#f1f5f9" strokeWidth="5" />
            {segments.map((seg) => (
              <circle
                key={seg.status}
                cx="18"
                cy="18"
                r="14"
                fill="none"
                stroke={seg.color}
                strokeWidth="5"
                strokeDasharray={seg.dashArray}
                strokeDashoffset={seg.dashOffset}
                strokeLinecap="round"
                className="transition-all duration-700"
              />
            ))}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-slate-900">{total}</span>
            <span className="text-[10px] text-slate-400">projects</span>
          </div>
        </div>
        {/* Legend */}
        <div className="flex-1 space-y-2">
          {segments.map((seg) => (
            <div key={seg.status} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: seg.color }} />
                <span className="text-slate-600">{seg.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-900">{seg.count}</span>
                <span className="text-xs text-slate-400">({seg.pct.toFixed(0)}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function TeamUtilizationChart({ teams }) {
  if (!teams || teams.length === 0) return null;

  const sorted = [...teams].sort((a, b) => b.memberCount - a.memberCount);
  const maxMembers = Math.max(...sorted.map((t) => t.memberCount));

  const barColors = [
    'from-brand-400 to-brand-600',
    'from-emerald-400 to-emerald-600',
    'from-violet-400 to-violet-600',
    'from-amber-400 to-amber-600',
    'from-cyan-400 to-cyan-600',
    'from-rose-400 to-rose-600',
    'from-blue-400 to-blue-600',
    'from-lime-400 to-lime-600',
    'from-fuchsia-400 to-fuchsia-600',
    'from-teal-400 to-teal-600',
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="section-heading mb-1">Team size</h3>
      <p className="mb-5 text-xs text-slate-400">{teams.length} teams</p>
      <div className="space-y-3">
        {sorted.map((team, i) => {
          const pct = (team.memberCount / maxMembers) * 100;
          return (
            <div key={team.id}>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700 truncate max-w-[140px]">{team.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">{team.memberCount} members</span>
                  <span className="text-slate-400">·</span>
                  <span className="text-slate-400">{team.projectCount} projects</span>
                </div>
              </div>
              <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${barColors[i % barColors.length]} transition-all duration-500`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
