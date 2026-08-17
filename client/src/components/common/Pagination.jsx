export default function Pagination({ offset, limit, total, onChange }) {
  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(total / limit);
  const hasNext = offset + limit < total;
  const hasPrev = offset > 0;

  if (total <= limit) return null;

  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-slate-500">
        Showing {offset + 1}–{Math.min(offset + limit, total)} of {total}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={!hasPrev}
          onClick={() => onChange(offset - limit)}
          className="btn-ghost disabled:opacity-40 disabled:cursor-not-allowed"
        >
          ← Previous
        </button>
        <span className="text-sm text-slate-500">
          Page {currentPage} of {totalPages}
        </span>
        <button
          type="button"
          disabled={!hasNext}
          onClick={() => onChange(offset + limit)}
          className="btn-ghost disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
