export default function LoadingSpinner({ label = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-500 dark:text-slate-400 animate-fade-in">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 dark:border-slate-600 border-t-brand-500" />
      <p className="text-sm">{label}</p>
    </div>
  );
}
