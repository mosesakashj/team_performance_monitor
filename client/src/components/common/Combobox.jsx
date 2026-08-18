import { useRef, useState, useEffect, useCallback } from 'react';

export default function Combobox({
  label,
  value,
  onChange,
  onSearch,
  results = [],
  isLoading = false,
  placeholder = 'Search...',
  renderOption,
  renderSelected,
  minQueryLength = 2,
}) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const handleSelect = useCallback(
    (item) => {
      onChange(item);
      setQuery('');
      setOpen(false);
      setActiveIndex(-1);
      inputRef.current?.blur();
    },
    [onChange]
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

  useEffect(() => {
    if (query.trim().length >= minQueryLength) {
      onSearch(query);
    }
  }, [query, minQueryLength, onSearch]);

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
    <div className="relative flex-1" ref={containerRef}>
      {label && (
        <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}
      {value ? (
        renderSelected ? (
          renderSelected(value, () => onChange(null))
        ) : (
          <div className="flex items-center justify-between rounded-xl border-2 border-brand-300 dark:border-brand-600 bg-brand-50 dark:bg-brand-900/20 px-4 py-3">
            <span className="text-sm font-medium text-brand-800 dark:text-brand-200">
              {value.label || value.name || String(value)}
            </span>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="text-brand-400 hover:text-brand-700"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )
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
            placeholder={placeholder}
            role="combobox"
            aria-expanded={open && results.length > 0}
            aria-autocomplete="list"
            className="w-full rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 py-3 pl-10 pr-3 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-brand-500 focus:outline-none focus:ring-0 transition-colors"
          />
        </div>
      )}
      {open && !value && query.trim().length >= minQueryLength && (
        <ul className="absolute z-20 mt-2 max-h-60 w-full overflow-auto rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-xl animate-scale-in">
          {isLoading && (
            <li className="px-4 py-3 text-sm text-slate-400 dark:text-slate-500">
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-200 dark:border-slate-600 border-t-brand-500 mr-2 align-middle" />
              Searching...
            </li>
          )}
          {!isLoading && results.length === 0 && (
            <li className="px-4 py-3 text-sm text-slate-400 dark:text-slate-500">No results found</li>
          )}
          {!isLoading &&
            results.map((result, index) => (
              <li
                key={result.id || index}
                role="option"
                aria-selected={index === activeIndex}
              >
                <button
                  type="button"
                  onMouseDown={() => handleSelect(result)}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors ${
                    index === activeIndex
                      ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
                  }`}
                >
                  {renderOption ? renderOption(result, index === activeIndex) : (
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      {result.label || result.name || String(result)}
                    </span>
                  )}
                </button>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}
