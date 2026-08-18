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

function PathNode({ node, isStart, isEnd }) {
  const isPerson = node.label === 'Person';
  const isMiddle = !isStart && !isEnd;

  const icons = {
    Project: '📁',
    Team: '👥',
    Endorsement: '⭐',
    Person: null,
  };

  return (
    <Link
      to={isPerson ? `/people/${node.id}` : '#'}
      className={`group/node relative flex flex-col items-center gap-2 transition-all ${
        isPerson ? 'cursor-pointer' : 'cursor-default'
      }`}
    >
      {/* Node circle */}
      <div className={`relative flex items-center justify-center rounded-2xl transition-all ${
        isPerson
          ? `h-16 w-16 ${
              isStart || isEnd
                ? 'bg-gradient-to-br from-brand-500 to-brand-600 shadow-lg shadow-brand-200 dark:shadow-brand-900/40 ring-4 ring-brand-100 dark:ring-brand-800/50'
                : 'bg-gradient-to-br from-brand-400 to-brand-500 shadow-md shadow-brand-100 dark:shadow-brand-900/30'
            } text-white`
          : 'h-14 w-14 bg-slate-100 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 text-lg'
      }`}>
        {isPerson ? (
          <span className="text-sm font-bold">
            {node.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
          </span>
        ) : (
          <span>{icons[node.label] || '🔗'}</span>
        )}
      </div>

      {/* Label */}
      <div className="text-center max-w-[100px]">
        {isPerson ? (
          <p className={`text-xs font-semibold truncate ${
            isStart || isEnd ? 'text-brand-700 dark:text-brand-300' : 'text-slate-700 dark:text-slate-300'
          }`}>
            {node.name}
          </p>
        ) : (
          <>
            <p className="text-[10px] font-medium text-slate-600 dark:text-slate-400 truncate">{node.name}</p>
            <span className="inline-block mt-0.5 rounded-full bg-slate-100 dark:bg-slate-700 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {node.label}
            </span>
          </>
        )}
      </div>
    </Link>
  );
}

function PathConnector({ relType, index }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 -mt-6">
      <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900 px-2 rounded-full">
        {relType.replace(/_/g, ' ')}
      </span>
      <svg className="h-6 w-6 text-brand-300 dark:text-brand-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
      </svg>
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
          See the shortest path between any two people through shared projects, teams, or endorsements.
        </p>
      </div>

      {/* Picker Section */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <PersonPicker label="From" selected={personA} onSelect={setPersonA} />
          <div className="flex items-center justify-center pb-1 sm:pb-0">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-100 to-brand-50 dark:from-brand-900/30 dark:to-brand-800/20 text-brand-400 dark:text-brand-500">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
              </svg>
            </div>
          </div>
          <PersonPicker label="To" selected={personB} onSelect={setPersonB} />
        </div>

        {personA && personB && (
          <div className="mt-4 flex justify-center">
            <button
              onClick={() => { setPersonA(null); setPersonB(null); }}
              className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
            >
              Clear selection
            </button>
          </div>
        )}
      </div>

      {/* Result */}
      {!personA || !personB ? (
        <EmptyState
          title="Pick two people"
          description="Select a person on each side to trace how they're connected through the graph."
          icon={
            <svg className="h-12 w-12 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
            </svg>
          }
        />
      ) : isLoading ? (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-12 shadow-sm">
          <LoadingSpinner label="Tracing connection..." />
        </div>
      ) : isError ? (
        error?.status === 404 ? (
          <div className="rounded-2xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-8 shadow-sm">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-900/40 text-red-500 dark:text-red-400 mb-4">
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </div>
              <h3 className="font-bold text-red-800 dark:text-red-200">No connection found</h3>
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">These two people aren't connected within 6 hops in the graph.</p>
            </div>
          </div>
        ) : (
          <ErrorBanner message="Couldn't trace this connection." onRetry={refetch} />
        )
      ) : (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm overflow-hidden animate-slide-up">
          {/* Header */}
          <div className="border-b border-slate-100 dark:border-slate-700 bg-gradient-to-r from-brand-50 to-white dark:from-brand-900/20 dark:to-slate-800 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 dark:bg-brand-800/50">
                  <svg className="h-5 w-5 text-brand-600 dark:text-brand-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {data.hops} hop{data.hops === 1 ? '' : 's'} apart
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Shortest path through the graph
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-brand-100 dark:bg-brand-900/30 px-3 py-1 text-xs font-bold text-brand-700 dark:text-brand-300">
                {data.pathNodes.length} nodes · {data.relTypes.length} edges
              </span>
            </div>
          </div>

          {/* Path Visualization */}
          <div className="p-6 overflow-x-auto">
            <div className="flex items-start justify-center gap-1 min-w-max py-4">
              {data.pathNodes.map((node, i) => (
                <div key={`${node.id}-${i}`} className="flex items-start animate-fade-in" style={{ animationDelay: `${i * 120}ms` }}>
                  <PathNode
                    node={node}
                    isStart={i === 0}
                    isEnd={i === data.pathNodes.length - 1}
                  />
                  {i < data.relTypes.length && (
                    <div className="mx-1 mt-4">
                      <PathConnector relType={data.relTypes[i]} index={i} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Footer summary */}
          <div className="border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 px-6 py-4">
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
              Path: {data.pathNodes.map((n) => n.name || n.label).join(' → ')}
            </p>
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">How connections work</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { icon: '📁', title: 'Shared Projects', desc: 'People who worked on the same project' },
            { icon: '👥', title: 'Same Team', desc: 'People in the same team or department' },
            { icon: '⭐', title: 'Endorsements', desc: 'People who endorsed each other' },
          ].map((item) => (
            <div key={item.title} className="flex items-start gap-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 p-4">
              <span className="text-xl">{item.icon}</span>
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{item.title}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
