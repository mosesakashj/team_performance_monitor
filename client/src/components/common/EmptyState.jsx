export default function EmptyState({ title = 'Nothing here yet', description, action, icon }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-6 py-16 text-center animate-fade-in">
      {icon && <div className="text-4xl opacity-40">{icon}</div>}
      <p className="text-base font-medium text-slate-700 dark:text-slate-300">{title}</p>
      {description && <p className="max-w-sm text-sm text-slate-500 dark:text-slate-400">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
