import { Link } from 'react-router-dom';

export default function SkillGapBar({ gap }) {
  const maxBar = Math.max(gap.demandCount, gap.supplyCount);
  return (
    <div className="group">
      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <Link to={`/skills/${gap.skill.id}`} className="text-sm font-semibold text-slate-800 dark:text-slate-200 hover:text-brand-600 dark:hover:text-brand-400 truncate block">
            {gap.skill.name}
          </Link>
          <p className="text-[10px] text-slate-400 dark:text-slate-500">{gap.demandCount} projects need · {gap.supplyCount} have it</p>
        </div>
        <div className="shrink-0 text-right w-16">
          <span className={`text-sm font-bold ${gap.ratio > 2 ? 'text-red-600 dark:text-red-400' : gap.ratio > 1 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
            {gap.ratio?.toFixed(1)}x
          </span>
        </div>
      </div>
      <div className="mt-1.5 flex gap-1 h-2">
        <div className="rounded-full bg-rose-200 dark:bg-rose-900/40 h-full" style={{ width: `${(gap.demandCount / maxBar) * 100}%` }} />
        <div className="rounded-full bg-emerald-200 dark:bg-emerald-900/40 h-full" style={{ width: `${(gap.supplyCount / maxBar) * 100}%` }} />
      </div>
    </div>
  );
}
