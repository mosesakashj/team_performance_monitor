import { useHealth } from '../../hooks/useHealth.js';

export default function HealthBanner() {
  const { data, isError } = useHealth();
  const degraded = isError || (data && data.up === false);

  if (!degraded) return null;

  return (
    <div className="relative bg-amber-500 px-4 py-2.5 text-center text-sm font-medium text-white">
      <div className="flex items-center justify-center gap-2">
        <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
        <span>Having trouble reaching the database — some pages may not load. Retrying automatically.</span>
      </div>
    </div>
  );
}
