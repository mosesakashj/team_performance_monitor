import { useState, useRef, useEffect, useCallback } from 'react';
import { useSearch } from '../../hooks/useSearch.js';

export default function PersonPicker({ label, selected, onSelect }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const { data, isFetching } = useSearch(query);
  const people = (data?.results ?? []).filter((r) => r.type === 'Person');

  const handleSelect = useCallback(
    (person) => {
      onSelect(person);
      setQuery('');
      setOpen(false);
      setActiveIndex(-1);
    },
    [onSelect]
  );

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleKeyDown(e) {
    if (!open || people.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((i) => (i + 1) % people.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((i) => (i - 1 + people.length) % people.length);
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0) handleSelect(people[activeIndex]);
        break;
      case 'Escape':
        setOpen(false);
        setActiveIndex(-1);
        inputRef.current?.blur();
        break;
    }
  }

  return (
    <div className="relative flex-1" ref={containerRef}>
      <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>
      {selected ? (
        <div className="flex items-center justify-between rounded-xl border-2 border-brand-300 dark:border-brand-600 bg-brand-50 dark:bg-brand-900/20 px-4 py-3 transition-all">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-100 dark:bg-brand-800/50 text-sm font-semibold text-brand-700 dark:text-brand-300">
              {selected.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
            </div>
            <div>
              <span className="text-sm font-semibold text-brand-800 dark:text-brand-200 block">{selected.name}</span>
              {selected.label && <span className="text-[11px] text-brand-500 dark:text-brand-400">{selected.label}</span>}
            </div>
          </div>
          <button
            type="button"
            onClick={() => onSelect(null)}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-brand-400 hover:text-brand-700 dark:hover:text-brand-200 hover:bg-brand-100 dark:hover:bg-brand-800/50 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      ) : (
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
              setActiveIndex(-1);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="Search for a person..."
            className="w-full rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 py-3 pl-10 pr-3 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-brand-500 focus:outline-none focus:ring-0 transition-colors"
          />
        </div>
      )}
      {open && !selected && query.trim().length >= 2 && (
        <ul className="absolute z-20 mt-2 max-h-60 w-full overflow-auto rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-xl animate-scale-in">
          {isFetching && (
            <li className="px-4 py-3 text-sm text-slate-400 dark:text-slate-500">
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-200 dark:border-slate-600 border-t-brand-500 mr-2 align-middle" />
              Searching...
            </li>
          )}
          {!isFetching && people.length === 0 && (
            <li className="px-4 py-3 text-sm text-slate-400 dark:text-slate-500">No people found</li>
          )}
          {!isFetching &&
            people.map((p, index) => (
              <li
                key={p.id}
                role="option"
                aria-selected={index === activeIndex}
              >
                <button
                  type="button"
                  onMouseDown={() => handleSelect(p)}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors ${
                    index === activeIndex ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
                  }`}
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-100 dark:bg-brand-800/50 text-xs font-semibold text-brand-700 dark:text-brand-300">
                    {p.label.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="min-w-0">
                    <span className="font-medium text-slate-900 dark:text-slate-100 block truncate">{p.label}</span>
                    {p.subtitle && <span className="text-[11px] text-slate-400 dark:text-slate-500 block truncate">{p.subtitle}</span>}
                  </div>
                </button>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}
