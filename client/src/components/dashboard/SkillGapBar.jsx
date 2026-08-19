import { Link } from 'react-router-dom';

export default function SkillGapBar({ gap }) {
  const maxBar = Math.max(gap.demandCount, gap.supplyCount);
  const demandPct = maxBar > 0 ? (gap.demandCount / maxBar) * 100 : 0;
  const supplyPct = maxBar > 0 ? (gap.supplyCount / maxBar) * 100 : 0;

  const gapLevel =
    gap.ratio > 2 ? 'critical' : gap.ratio > 1.5 ? 'warning' : gap.ratio > 1 ? 'mild' : 'healthy';

  const ratioColors = {
    critical: 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/40',
    warning: 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/40',
    mild: 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/40',
    healthy: 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/40',
  };

  return (
    <div className="group rounded-xl border border-transparent p-3 transition-all duration-200 hover:border-slate-200 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/30">
      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <Link
            to={`/skills/${gap.skill.id}`}
            className="text-sm font-semibold text-slate-800 dark:text-slate-200 hover:text-brand-600 dark:hover:text-brand-400 truncate block transition-colors"
          >
            {gap.skill.name}
          </Link>
          <div className="mt-0.5 flex items-center gap-2 text-[11px] text-slate-400 dark:text-slate-500">
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
              {gap.demandCount} need
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              {gap.supplyCount} have
            </span>
          </div>
        </div>
        <div className="shrink-0">
          <span className={`inline-flex items-center rounded-lg px-2 py-1 text-xs font-bold ${ratioColors[gapLevel]}`}>
            {gap.ratio?.toFixed(1)}x
          </span>
        </div>
      </div>

      {/* Dual bar */}
      <div className="mt-3 space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="w-10 text-[10px] font-medium text-slate-400 dark:text-slate-500">Demand</span>
          <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-700/50 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-rose-400 to-rose-500 transition-all duration-700 ease-out"
              style={{ width: `${demandPct}%` }}
            />
          </div>
          <span className="w-6 text-right text-[10px] font-bold text-slate-600 dark:text-slate-300">{gap.demandCount}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-10 text-[10px] font-medium text-slate-400 dark:text-slate-500">Supply</span>
          <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-700/50 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-700 ease-out"
              style={{ width: `${supplyPct}%` }}
            />
          </div>
          <span className="w-6 text-right text-[10px] font-bold text-slate-600 dark:text-slate-300">{gap.supplyCount}</span>
        </div>
      </div>
    </div>
  );
}
