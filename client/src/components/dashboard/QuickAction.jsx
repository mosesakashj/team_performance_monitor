import { Link } from 'react-router-dom';

export default function QuickAction({ to, title, description, icon }) {
  return (
    <Link
      to={to}
      className="flex items-start gap-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 transition-all hover:border-brand-300 dark:hover:border-brand-500 hover:shadow-md hover:shadow-brand-50 dark:hover:shadow-brand-900/20"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</p>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{description}</p>
      </div>
      <svg className="ml-auto h-5 w-5 shrink-0 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
      </svg>
    </Link>
  );
}
