import { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useSearch } from '../hooks/useSearch.js';
import { usePersonPath } from '../hooks/usePeople.js';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import ErrorBanner from '../components/common/ErrorBanner.jsx';
import EmptyState from '../components/common/EmptyState.jsx';

function PersonPicker({ label, selected, onSelect }) {
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
      <label className="mb-2 block text-sm font-medium text-slate-700">{label}</label>
      {selected ? (
        <div className="flex items-center justify-between rounded-xl border border-brand-300 bg-brand-50 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
              {selected.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
            </div>
            <span className="text-sm font-medium text-brand-800">{selected.name}</span>
          </div>
          <button type="button" onClick={() => onSelect(null)} className="text-xs font-medium text-brand-600 hover:text-brand-800 transition-colors">
            Change
          </button>
        </div>
      ) : (
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
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
            placeholder="Search for a person…"
            className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-9 pr-3 text-sm placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
      )}
      {open && !selected && query.trim().length >= 2 && (
        <ul className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-slate-200 bg-white shadow-xl animate-scale-in">
          {isFetching && (
            <li className="px-3 py-2.5 text-sm text-slate-400">
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-brand-500 mr-2 align-middle" />
              Searching…
            </li>
          )}
          {!isFetching && people.length === 0 && (
            <li className="px-3 py-2.5 text-sm text-slate-400">No people found</li>
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
                  className={`flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors ${
                    index === activeIndex ? 'bg-brand-50 text-brand-700' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
                    {p.label.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  </div>
                  <span className="truncate font-medium">{p.label}</span>
                </button>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}

export default function ConnectionFinderPage() {
  const [personA, setPersonA] = useState(null);
  const [personB, setPersonB] = useState(null);
  const { data, isLoading, isError, error, refetch } = usePersonPath(personA?.id, personB?.id);

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      <div>
        <h1 className="page-heading">Find a connection</h1>
        <p className="page-description">
          See the shortest path between any two people through shared projects, teams, or endorsements — a variable-length
          traversal a relational join could not express without a recursive query.
        </p>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row">
        <PersonPicker label="Person A" selected={personA} onSelect={setPersonA} />
        <div className="flex items-center justify-center pt-6 sm:pt-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
            </svg>
          </div>
        </div>
        <PersonPicker label="Person B" selected={personB} onSelect={setPersonB} />
      </div>

      {!personA || !personB ? (
        <EmptyState
          title="Pick two people"
          description="Select a person on each side to trace how they're connected."
          icon="🔗"
        />
      ) : isLoading ? (
        <LoadingSpinner label="Tracing connection…" />
      ) : isError ? (
        error?.status === 404 ? (
          <EmptyState
            title="No connection found"
            description="These two people aren't connected within 6 hops."
            icon="❌"
          />
        ) : (
          <ErrorBanner message="Couldn't trace this connection." onRetry={refetch} />
        )
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm animate-slide-up">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100">
              <svg className="h-5 w-5 text-brand-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {data.hops} hop{data.hops === 1 ? '' : 's'} apart
              </p>
              <p className="text-xs text-slate-500">
                {personA.name} → {personB.name}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {data.pathNodes.map((node, i) => (
              <div key={`${node.id}-${i}`} className="flex items-center gap-3 animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                {node.label === 'Person' ? (
                  <Link
                    to={`/people/${node.id}`}
                    className="flex items-center gap-2 rounded-xl border-2 border-brand-200 bg-brand-50 px-4 py-2.5 text-sm font-semibold text-brand-800 transition-all hover:border-brand-400 hover:shadow-md"
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-[10px] font-bold text-brand-700">
                      {node.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                    </div>
                    {node.name}
                  </Link>
                ) : (
                  <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-600">
                    <span className="text-base">
                      {node.label === 'Project' ? '📁' : node.label === 'Team' ? '👥' : '⭐'}
                    </span>
                    <span className="font-medium">{node.name}</span>
                    <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-500 uppercase">
                      {node.label}
                    </span>
                  </div>
                )}
                {i < data.relTypes.length && (
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {data.relTypes[i].replace(/_/g, ' ')}
                    </span>
                    <svg className="h-4 w-4 text-slate-300" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
