export function SkeletonTile() {
  return (
    <div className="stat-card">
      <div className="skeleton h-4 w-24 mb-3" />
      <div className="skeleton h-8 w-16" />
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="card-base">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="skeleton h-5 w-32" />
        <div className="skeleton h-5 w-16 rounded-full" />
      </div>
      <div className="skeleton h-4 w-24 mb-3" />
      <div className="skeleton h-3 w-40" />
    </div>
  );
}

export function SkeletonList({ rows = 5 }) {
  return (
    <div className="list-container">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center justify-between px-4 py-3">
          <div>
            <div className="skeleton h-4 w-32 mb-1.5" />
            <div className="skeleton h-3 w-24" />
          </div>
          <div className="skeleton h-5 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 5 }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="bg-slate-50 px-4 py-3">
        <div className="flex gap-4">
          {Array.from({ length: cols }).map((_, i) => (
            <div key={i} className="skeleton h-3 flex-1" />
          ))}
        </div>
      </div>
      {Array.from({ length: rows }).map((_, row) => (
        <div key={row} className="border-t border-slate-100 px-4 py-3">
          <div className="flex gap-4">
            {Array.from({ length: cols }).map((_, col) => (
              <div key={col} className="skeleton h-4 flex-1" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonGrid({ count = 6, cols = 3 }) {
  return (
    <div className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-${cols}`}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
