import { Link } from 'react-router-dom';

export default function QuickAction({ to, title, description, icon, color = 'brand' }) {
  const colorMap = {
    brand: 'bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 group-hover:bg-brand-100 dark:group-hover:bg-brand-900/50',
    green: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/50',
    violet: 'bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 group-hover:bg-violet-100 dark:group-hover:bg-violet-900/50',
  };

  return (
    <Link
      to={to}
      className="group flex items-start gap-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 transition-all duration-200 hover:border-brand-300 dark:hover:border-brand-500 hover:shadow-lg hover:shadow-brand-100 dark:hover:shadow-brand-900/20 hover:-translate-y-0.5"
    >
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110 ${colorMap[color] || colorMap.brand}`}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-brand-700 dark:group-hover:text-brand-400 transition-colors">{title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400 line-clamp-2">{description}</p>
      </div>
      <svg className="ml-2 h-5 w-5 shrink-0 text-slate-300 dark:text-slate-600 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-brand-500 dark:group-hover:text-brand-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
      </svg>
    </Link>
  );
}
