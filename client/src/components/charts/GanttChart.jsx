import { useMemo } from 'react';
import { Link } from 'react-router-dom';

const STATUS_COLORS = {
  active: 'bg-emerald-500',
  proposed: 'bg-amber-500',
  completed: 'bg-slate-400',
  on_hold: 'bg-red-400',
};

export default function GanttChart({ projects = [] }) {
  const { timeline, minDate, maxDate } = useMemo(() => {
    const validProjects = projects.filter((p) => p.project?.start_date);
    if (validProjects.length === 0) return { timeline: [], minDate: null, maxDate: null };

    const dates = validProjects.flatMap((p) => [
      new Date(p.project.start_date),
      p.project.end_date ? new Date(p.project.end_date) : new Date(),
    ]);
    const min = new Date(Math.min(...dates));
    const max = new Date(Math.max(...dates));

    const totalDays = Math.ceil((max - min) / (1000 * 60 * 60 * 24)) || 1;

    const timeline = validProjects.map((p) => {
      const start = new Date(p.project.start_date);
      const end = p.project.end_date ? new Date(p.project.end_date) : new Date();
      const startOffset = Math.max(0, Math.ceil((start - min) / (1000 * 60 * 60 * 24)));
      const duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) || 1;

      return {
        ...p,
        startOffset,
        duration,
        widthPercent: (duration / totalDays) * 100,
        leftPercent: (startOffset / totalDays) * 100,
      };
    });

    return { timeline, minDate: min, maxDate: max };
  }, [projects]);

  if (timeline.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 text-center">
        <p className="text-sm text-slate-500 dark:text-slate-400">No projects with start dates to display</p>
      </div>
    );
  }

  const months = useMemo(() => {
    if (!minDate || !maxDate) return [];
    const result = [];
    const current = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
    while (current <= maxDate) {
      result.push({
        label: current.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        date: new Date(current),
      });
      current.setMonth(current.getMonth() + 1);
    }
    return result;
  }, [minDate, maxDate]);

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Month headers */}
          <div className="flex border-b border-slate-200 dark:border-slate-700">
            <div className="w-48 shrink-0 px-4 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
              Project
            </div>
            <div className="flex-1 flex">
              {months.map((m, i) => (
                <div key={i} className="flex-1 px-2 py-2 text-xs text-center text-slate-400 dark:text-slate-500 border-l border-slate-100 dark:border-slate-700">
                  {m.label}
                </div>
              ))}
            </div>
          </div>

          {/* Project rows */}
          {timeline.map((item) => (
            <div key={item.project.id} className="flex items-center border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
              <div className="w-48 shrink-0 px-4 py-3">
                <Link
                  to={`/projects/${item.project.id}`}
                  className="text-sm font-medium text-slate-800 dark:text-slate-200 hover:text-brand-600 dark:hover:text-brand-400 transition-colors line-clamp-1"
                >
                  {item.project.name}
                </Link>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">{item.project.client_name}</p>
              </div>
              <div className="flex-1 relative h-10 px-2">
                <div
                  className={`absolute top-2 h-6 rounded-full ${STATUS_COLORS[item.project.status] || 'bg-brand-500'} opacity-80 flex items-center justify-center`}
                  style={{
                    left: `${item.leftPercent}%`,
                    width: `${Math.max(item.widthPercent, 2)}%`,
                  }}
                >
                  <span className="text-[10px] font-medium text-white px-2 truncate">
                    {item.project.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
