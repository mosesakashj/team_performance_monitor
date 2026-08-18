import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useEndorsements } from '../hooks/useHierarchy.js';
import { useSkillsList } from '../hooks/useSkills.js';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import ErrorBanner from '../components/common/ErrorBanner.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import Pagination from '../components/common/Pagination.jsx';

const ITEMS_PER_PAGE = 9;

function EndorseeCard({ endorsee, endorsements, endorsementCount }) {
  return (
    <div className="group rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm hover:shadow-lg hover:shadow-brand-50/50 dark:hover:shadow-brand-900/20 transition-all animate-fade-in">
      <div className="flex items-start gap-4">
        <Link
          to={`/people/${endorsee.id}`}
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-sm font-bold text-white shadow-md shadow-emerald-200 dark:shadow-emerald-900/40 group-hover:shadow-lg transition-shadow"
        >
          {endorsee.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
        </Link>
        <div className="flex-1 min-w-0">
          <Link to={`/people/${endorsee.id}`} className="font-semibold text-slate-900 dark:text-slate-100 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
            {endorsee.name}
          </Link>
          <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{endorsee.title}</p>
          <div className="mt-2 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
              <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
              </svg>
              {endorsementCount} endorsement{endorsementCount !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        {endorsements.slice(0, 3).map((e, i) => (
          <div key={i} className="flex items-start gap-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 p-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-800/50 text-xs font-semibold text-brand-700 dark:text-brand-300">
              {e.endorser.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                <Link to={`/people/${e.endorser.id}`} className="font-medium text-slate-900 dark:text-slate-200 hover:text-brand-600 dark:hover:text-brand-400">
                  {e.endorser.name}
                </Link>
                {e.note ? (
                  <span className="italic"> — "{e.note}"</span>
                ) : null}
              </p>
              {e.date && <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{e.date}</p>}
            </div>
          </div>
        ))}
        {endorsements.length > 3 && (
          <p className="text-center text-xs font-medium text-slate-400 dark:text-slate-500 pt-1">
            +{endorsements.length - 3} more endorsement{endorsements.length - 3 !== 1 ? 's' : ''}
          </p>
        )}
      </div>
    </div>
  );
}

export default function EndorsementsPage() {
  const [selectedSkill, setSelectedSkill] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const { data: endorsements, isLoading, isError, refetch } = useEndorsements(selectedSkill || null);
  const { data: skillsResp } = useSkillsList();
  const skillList = skillsResp?.skills || [];

  const filteredEndorsements = useMemo(() => {
    if (!endorsements) return [];
    if (!searchQuery.trim()) return endorsements;
    const q = searchQuery.toLowerCase();
    return endorsements.filter(
      (item) =>
        item.endorsee.name.toLowerCase().includes(q) ||
        item.endorsee.title?.toLowerCase().includes(q) ||
        item.endorsements.some((e) => e.endorser.name.toLowerCase().includes(q) || e.note?.toLowerCase().includes(q))
    );
  }, [endorsements, searchQuery]);

  const totalPages = Math.ceil(filteredEndorsements.length / ITEMS_PER_PAGE);
  const paginatedEndorsements = filteredEndorsements.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleSkillChange = (skillId) => {
    setSelectedSkill(skillId);
    setCurrentPage(1);
    setSearchQuery('');
  };

  if (isError) return <div className="animate-fade-in"><ErrorBanner message="Couldn't load endorsements." onRetry={refetch} /></div>;
  if (isLoading) return <LoadingSpinner label="Loading endorsements…" />;

  const totalEndorsementCount = endorsements?.reduce((sum, item) => sum + item.endorsementCount, 0) || 0;
  const uniqueEndorsers = new Set(endorsements?.flatMap((item) => item.endorsements.map((e) => e.endorser.id))).size;

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div>
        <h1 className="page-heading">Endorsements</h1>
        <p className="page-description">See who has endorsed whom and discover skill strengths across the team.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Endorsements</p>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">{totalEndorsementCount}</p>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Endorsed People</p>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">{endorsements?.length || 0}</p>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Unique Endorsers</p>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">{uniqueEndorsers}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            placeholder="Search by name, title, or note..."
            className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 py-2.5 pl-10 pr-4 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
        <div className="text-sm text-slate-500 dark:text-slate-400">
          {filteredEndorsements.length} result{filteredEndorsements.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Skill Filter */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => handleSkillChange('')}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
            !selectedSkill
              ? 'bg-brand-600 text-white shadow-sm shadow-brand-200 dark:shadow-brand-900/40'
              : 'border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
          }`}
        >
          All Skills
        </button>
        {skillList.slice(0, 12).map((skill) => (
          <button
            key={skill.id}
            onClick={() => handleSkillChange(skill.id === selectedSkill ? '' : skill.id)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
              selectedSkill === skill.id
                ? 'bg-brand-600 text-white shadow-sm shadow-brand-200 dark:shadow-brand-900/40'
                : 'border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            {skill.name}
          </button>
        ))}
      </div>

      {/* Content */}
      {!paginatedEndorsements.length ? (
        <EmptyState
          title="No endorsements found"
          description={selectedSkill ? 'No endorsements found for this skill.' : searchQuery ? 'No endorsements match your search.' : 'No endorsements have been recorded yet.'}
          icon={<svg className="h-12 w-12 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" /></svg>}
        />
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {paginatedEndorsements.map((item) => (
              <EndorseeCard key={item.endorsee.id} {...item} />
            ))}
          </div>
          <Pagination offset={(currentPage - 1) * ITEMS_PER_PAGE} limit={ITEMS_PER_PAGE} total={filteredEndorsements.length} onChange={(newOffset) => setCurrentPage(Math.floor(newOffset / ITEMS_PER_PAGE) + 1)} />
        </>
      )}
    </div>
  );
}
