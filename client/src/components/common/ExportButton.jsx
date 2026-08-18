import { useState, useRef, useEffect } from 'react';
import { exportToCSV, exportToJSON } from '../../utils/exportData.js';

export function ExportButton({ data, filename, columns }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const filtered = columns
    ? data.map((row) => {
        const out = {};
        for (const key of columns) {
          if (row[key] !== undefined) out[key] = row[key];
        }
        return out;
      })
    : data;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors dark:text-slate-200 dark:bg-slate-800 dark:border-slate-600 dark:hover:bg-slate-700"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Export
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-1 w-40 bg-white border border-slate-200 rounded-lg shadow-lg dark:bg-slate-800 dark:border-slate-600">
          <button
            onClick={() => { exportToCSV(filtered, `${filename}.csv`); setOpen(false); }}
            className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700 dark:text-slate-200 rounded-t-lg"
          >
            Export as CSV
          </button>
          <button
            onClick={() => { exportToJSON(filtered, `${filename}.json`); setOpen(false); }}
            className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700 dark:text-slate-200 rounded-b-lg"
          >
            Export as JSON
          </button>
        </div>
      )}
    </div>
  );
}
