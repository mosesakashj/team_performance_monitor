import { useState, useEffect } from 'react';

function AnimatedNumber({ value, duration = 800 }) {
  const [display, setDisplay] = useState(0);
  const target = typeof value === 'number' ? value : parseInt(value) || 0;

  useEffect(() => {
    if (target === 0) return;
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);

  return <span>{display.toLocaleString()}</span>;
}

export default function StatTile({ label, value, icon, color = 'brand', trend, trendUp }) {
  const colorMap = {
    brand: 'from-brand-500 to-brand-600',
    green: 'from-emerald-500 to-emerald-600',
    amber: 'from-amber-500 to-amber-600',
    slate: 'from-slate-500 to-slate-600',
    red: 'from-red-500 to-red-600',
    violet: 'from-violet-500 to-violet-600',
  };

  return (
    <div className="stat-card group relative overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-br ${colorMap[color]} opacity-[0.03] transition-opacity group-hover:opacity-[0.06]`} />
      <div className="relative">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</span>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 transition-colors group-hover:bg-brand-50 dark:group-hover:bg-brand-900/30 group-hover:text-brand-600 dark:group-hover:text-brand-400">
            {icon}
          </span>
        </div>
        <p className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          {value !== null && value !== undefined ? <AnimatedNumber value={value} /> : '—'}
        </p>
        {trend && (
          <div className="mt-1.5 flex items-center gap-1">
            {trendUp !== undefined && (
              <svg className={`h-3 w-3 ${trendUp ? 'text-emerald-500' : 'text-red-500'}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d={trendUp ? 'M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25' : 'M4.5 4.5l15 15m0 0V8.25m0 11.25H8.25'} />
              </svg>
            )}
            <p className="text-xs text-slate-400 dark:text-slate-500">{trend}</p>
          </div>
        )}
      </div>
    </div>
  );
}
