import { useRef, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSearch } from '../../hooks/useSearch.js';

const TYPE_ROUTES = {
  Person: (id) => `/people/${id}`,
  Project: (id) => `/projects/${id}`,
  Skill: (id) => `/skills/${id}`,
};

const TYPE_ICONS = {
  Person: '👤',
  Project: '📁',
  Skill: '⚡',
};

export default function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const { data, isFetching } = useSearch(query);
  const results = data?.results ?? [];

  const handleSelect = useCallback(
    (result) => {
      const routeFn = TYPE_ROUTES[result.type];
      if (routeFn) navigate(routeFn(result.id));
      setQuery('');
      setOpen(false);
      setActiveIndex(-1);
      inputRef.current?.blur();
    },
    [navigate]
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
    if (!open || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((i) => (i + 1) % results.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((i) => (i - 1 + results.length) % results.length);
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0) handleSelect(results[activeIndex]);
        break;
      case 'Escape':
        setOpen(false);
        setActiveIndex(-1);
        inputRef.current?.blur();
        break;
    }
  }

  return (
    <div className="relative w-full max-w-sm" ref={containerRef}>
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
          data-search-input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search people, projects, skills..."
          role="combobox"
          aria-expanded={open && results.length > 0}
          aria-autocomplete="list"
          aria-controls="search-listbox"
          className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 py-2 pl-9 pr-3 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
      </div>

      {open && query.trim().length >= 2 && (
        <ul
          id="search-listbox"
          role="listbox"
          className="absolute z-30 mt-1 w-full overflow-hidden rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-xl animate-scale-in"
        >
          {isFetching && (
            <li className="px-3 py-2.5 text-sm text-slate-400 dark:text-slate-500">
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-200 dark:border-slate-600 border-t-brand-500 mr-2 align-middle" />
              Searching...
            </li>
          )}
          {!isFetching && results.length === 0 && (
            <li className="px-3 py-2.5 text-sm text-slate-400 dark:text-slate-500">No matches for "{query}"</li>
          )}
          {!isFetching &&
            results.map((result, index) => (
              <li
                key={`${result.type}-${result.id}`}
                role="option"
                aria-selected={index === activeIndex}
              >
                <button
                  type="button"
                  onMouseDown={() => handleSelect(result)}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={`flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors ${
                    index === activeIndex ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
                  }`}
                >
                  <span className="text-base">{TYPE_ICONS[result.type]}</span>
                  <span className="flex-1 truncate font-medium text-slate-900 dark:text-slate-100">{result.label}</span>
                  <span className="shrink-0 rounded-full bg-slate-100 dark:bg-slate-700 px-2 py-0.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                    {result.type}
                  </span>
                </button>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}
