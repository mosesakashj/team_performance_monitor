export default function FilterBar({ children, isLoading = false }) {
  return (
    <div className={`flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 ${isLoading ? 'opacity-60 pointer-events-none' : ''}`}>
      {isLoading ? (
        <div className="flex flex-wrap items-center gap-3 w-full">
          <div className="h-10 flex-1 min-w-[200px] rounded-lg bg-slate-100 animate-pulse" />
          <div className="h-10 w-[160px] rounded-lg bg-slate-100 animate-pulse" />
          <div className="h-10 w-[160px] rounded-lg bg-slate-100 animate-pulse" />
        </div>
      ) : (
        children
      )}
    </div>
  );
}

export function FilterInput({ value, onChange, placeholder, className = '' }) {
  return (
    <input
      type="search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`min-w-[200px] flex-1 filter-input ${className}`}
    />
  );
}

export function FilterSelect({ value, onChange, options, placeholder, className = '' }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`filter-select ${className}`}
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

export function FilterCheckbox({ checked, onChange, label }) {
  return (
    <label className="flex items-center gap-2 text-sm text-slate-600">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
      />
      {label}
    </label>
  );
}
