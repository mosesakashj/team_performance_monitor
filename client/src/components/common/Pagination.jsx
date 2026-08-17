import { useMemo } from 'react';

export default function Pagination({ offset, limit, total, onChange, pageSizeOptions }) {
  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(total / limit);
  const hasNext = offset + limit < total;
  const hasPrev = offset > 0;

  const pageNumbers = useMemo(() => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage <= 3) {
        end = Math.min(4, totalPages - 1);
      }
      if (currentPage >= totalPages - 2) {
        start = Math.max(totalPages - 3, 2);
      }

      if (start > 2) pages.push('...');
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < totalPages - 1) pages.push('...');
      if (totalPages > 1) pages.push(totalPages);
    }

    return pages;
  }, [currentPage, totalPages]);

  if (total <= 0) return null;

  return (
    <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
      <div className="flex items-center gap-4">
        <p className="text-sm text-slate-500">
          Showing <span className="font-medium text-slate-700">{offset + 1}</span>–<span className="font-medium text-slate-700">{Math.min(offset + limit, total)}</span> of <span className="font-medium text-slate-700">{total}</span>
        </p>
        {pageSizeOptions && (
          <select
            value={limit}
            onChange={(e) => onChange(0, Number(e.target.value))}
            className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>{size} / page</option>
            ))}
          </select>
        )}
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={!hasPrev}
          onClick={() => onChange(offset - limit)}
          className="flex h-8 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Prev
        </button>

        {pageNumbers.map((page, i) =>
          page === '...' ? (
            <span key={`ellipsis-${i}`} className="px-1 text-sm text-slate-400">…</span>
          ) : (
            <button
              key={page}
              type="button"
              onClick={() => onChange((page - 1) * limit)}
              className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition-all ${
                page === currentPage
                  ? 'bg-brand-600 text-white shadow-sm shadow-brand-200'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {page}
            </button>
          )
        )}

        <button
          type="button"
          disabled={!hasNext}
          onClick={() => onChange(offset + limit)}
          className="flex h-8 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white"
        >
          Next
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>
    </div>
  );
}
