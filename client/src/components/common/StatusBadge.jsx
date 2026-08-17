import { statusColor } from '../../utils/statusColor.js';

const LABEL_MAP = {
  active: 'Active',
  proposed: 'Proposed',
  on_hold: 'On Hold',
  completed: 'Completed',
};

export default function StatusBadge({ status, className = '' }) {
  const color = statusColor(status);
  const label = LABEL_MAP[status] ?? status?.replace(/_/g, ' ');

  return (
    <span className={`badge-base ${COLOR_CLASSES[color]} ${className}`}>
      <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${DOT_CLASSES[color]}`} />
      {label}
    </span>
  );
}

const COLOR_CLASSES = {
  green: 'bg-emerald-50 text-emerald-700',
  brand: 'bg-brand-50 text-brand-700',
  amber: 'bg-amber-50 text-amber-700',
  slate: 'bg-slate-100 text-slate-600',
  red: 'bg-red-50 text-red-700',
};

const DOT_CLASSES = {
  green: 'bg-emerald-500',
  brand: 'bg-brand-500',
  amber: 'bg-amber-500',
  slate: 'bg-slate-400',
  red: 'bg-red-500',
};
