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

const COLOR_CONFIG = {
  brand: {
    gradient: 'from-brand-500 to-brand-600',
    ring: 'bg-brand-100 dark:bg-brand-900/40',
    icon: 'text-brand-600 dark:text-brand-400',
    glow: 'shadow-brand-200 dark:shadow-brand-900/40',
    dot: 'bg-brand-400',
  },
  green: {
    gradient: 'from-emerald-500 to-emerald-600',
    ring: 'bg-emerald-100 dark:bg-emerald-900/40',
    icon: 'text-emerald-600 dark:text-emerald-400',
    glow: 'shadow-emerald-200 dark:shadow-emerald-900/40',
    dot: 'bg-emerald-400',
  },
  amber: {
    gradient: 'from-amber-500 to-amber-600',
    ring: 'bg-amber-100 dark:bg-amber-900/40',
    icon: 'text-amber-600 dark:text-amber-400',
    glow: 'shadow-amber-200 dark:shadow-amber-900/40',
    dot: 'bg-amber-400',
  },
  slate: {
    gradient: 'from-slate-500 to-slate-600',
    ring: 'bg-slate-100 dark:bg-slate-700',
    icon: 'text-slate-600 dark:text-slate-400',
    glow: 'shadow-slate-200 dark:shadow-slate-900/40',
    dot: 'bg-slate-400',
  },
  red: {
    gradient: 'from-red-500 to-red-600',
    ring: 'bg-red-100 dark:bg-red-900/40',
    icon: 'text-red-600 dark:text-red-400',
    glow: 'shadow-red-200 dark:shadow-red-900/40',
    dot: 'bg-red-400',
  },
  violet: {
    gradient: 'from-violet-500 to-violet-600',
    ring: 'bg-violet-100 dark:bg-violet-900/40',
    icon: 'text-violet-600 dark:text-violet-400',
    glow: 'shadow-violet-200 dark:shadow-violet-900/40',
    dot: 'bg-violet-400',
  },
};

export default function StatTile({ label, value, icon, color = 'brand', trend, trendUp }) {
  const config = COLOR_CONFIG[color] || COLOR_CONFIG.brand;

  return (
    <div className="stat-card group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
      {/* Background gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-[0.03] transition-opacity duration-300 group-hover:opacity-[0.07]`} />

      {/* Accent dot */}
      <div className={`absolute right-4 top-4 h-1.5 w-1.5 rounded-full ${config.dot} opacity-40 transition-opacity group-hover:opacity-80`} />

      <div className="relative">
        {/* Icon with ring */}
        <div className="mb-4 flex items-center justify-between">
          <span className="text-[13px] font-medium text-slate-500 dark:text-slate-400">{label}</span>
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${config.ring} ${config.icon} transition-all duration-300 group-hover:scale-110 group-hover:shadow-md ${config.glow}`}>
            {icon}
          </div>
        </div>

        {/* Value */}
        <p className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
          {value !== null && value !== undefined ? <AnimatedNumber value={value} /> : '—'}
        </p>

        {/* Trend */}
        {trend && (
          <div className="mt-2 flex items-center gap-1.5">
            {trendUp !== undefined && (
              <span className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                trendUp
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                  : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
              }`}>
                <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d={trendUp ? 'M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25' : 'M4.5 4.5l15 15m0 0V8.25m0 11.25H8.25'} />
                </svg>
              </span>
            )}
            <p className="text-xs text-slate-400 dark:text-slate-500">{trend}</p>
          </div>
        )}
      </div>
    </div>
  );
}
