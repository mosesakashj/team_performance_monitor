import { useState } from 'react';
import { LEVEL_COLORS } from '../../utils/buildGraphData.js';

export default function TreeViewNode({ person, byManager, level, selectedNode, onSelect }) {
  const [expanded, setExpanded] = useState(level < 2);
  const reports = byManager[person.id]?.reports || [];
  const hasReports = reports.length > 0;
  const isSelected = selectedNode === person.id;
  const initials = person.name.split(' ').map((n) => n[0]).join('').slice(0, 2);
  const color = LEVEL_COLORS[Math.min(level, LEVEL_COLORS.length - 1)];

  return (
    <div>
      <button
        onClick={() => {
          onSelect(person.id);
          if (hasReports) setExpanded(!expanded);
        }}
        className={`flex w-full items-center gap-3 px-4 py-3.5 text-left transition-all ${
          isSelected
            ? 'bg-brand-50 dark:bg-brand-900/30'
            : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
        }`}
        style={{ paddingLeft: `${level * 32 + 16}px` }}
      >
        {hasReports ? (
          <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
            expanded ? 'border-brand-300 bg-brand-50 text-brand-600 dark:border-brand-600 dark:bg-brand-900/30 dark:text-brand-400' : 'border-slate-300 bg-white text-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-500'
          }`}>
            <svg className={`h-3 w-3 transition-transform ${expanded ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </div>
        ) : (
          <div className="h-5 w-5 shrink-0" />
        )}
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white shadow-sm"
          style={{ background: `linear-gradient(135deg, ${color.bg}, ${color.border})` }}
        >
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className={`text-sm font-semibold truncate ${isSelected ? 'text-brand-700 dark:text-brand-300' : 'text-slate-800 dark:text-slate-200'}`}>
            {person.name}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{person.title}</p>
        </div>
        {hasReports && (
          <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
            isSelected ? 'bg-brand-100 text-brand-700 dark:bg-brand-800/50 dark:text-brand-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
          }`}>
            {reports.length}
          </span>
        )}
      </button>
      {expanded && hasReports && (
        <div>
          {reports.map((report) => (
            <TreeViewNode
              key={report.id}
              person={report}
              byManager={byManager}
              level={level + 1}
              selectedNode={selectedNode}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}
