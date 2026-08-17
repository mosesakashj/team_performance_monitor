const COLOR_MAP = {
  slate: 'bg-slate-100 text-slate-600',
  brand: 'bg-brand-50 text-brand-700',
  green: 'bg-emerald-50 text-emerald-700',
  amber: 'bg-amber-50 text-amber-700',
  red: 'bg-red-50 text-red-700',
};

export default function Badge({ children, color = 'slate', className = '' }) {
  return (
    <span className={`badge-base ${COLOR_MAP[color] ?? COLOR_MAP.slate} ${className}`}>
      {children}
    </span>
  );
}
