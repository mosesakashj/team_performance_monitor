import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useEndorsements } from '../hooks/useHierarchy.js';
import { useSkillsList } from '../hooks/useSkills.js';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import ErrorBanner from '../components/common/ErrorBanner.jsx';
import EmptyState from '../components/common/EmptyState.jsx';

function EndorseeCard({ endorsee, endorsements, endorsementCount }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow animate-fade-in">
      <div className="flex items-start gap-4">
        <Link
          to={`/people/${endorsee.id}`}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-sm font-bold text-white shadow-md shadow-emerald-200 hover:shadow-lg transition-shadow"
        >
          {endorsee.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
        </Link>
        <div className="flex-1 min-w-0">
          <Link to={`/people/${endorsee.id}`} className="font-semibold text-slate-900 hover:text-brand-600 transition-colors">
            {endorsee.name}
          </Link>
          <p className="text-sm text-slate-500">{endorsee.title}</p>
          <div className="mt-2 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
              </svg>
              {endorsementCount} endorsement{endorsementCount !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        {endorsements.map((e, i) => (
          <div key={i} className="flex items-start gap-3 rounded-lg bg-slate-50 p-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
              {e.endorser.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-slate-600">
                <Link to={`/people/${e.endorser.id}`} className="font-medium text-slate-900 hover:text-brand-600">
                  {e.endorser.name}
                </Link>
                {e.note ? ` — "${e.note}"` : ''}
              </p>
              {e.date && <p className="text-xs text-slate-400 mt-0.5">{e.date}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function EndorsementsPage() {
  const [selectedSkill, setSelectedSkill] = useState('');
  const { data: endorsements, isLoading, isError, refetch } = useEndorsements(selectedSkill || null);
  const { data: skills } = useSkillsList();

  if (isError) return <div className="animate-fade-in"><ErrorBanner message="Couldn't load endorsements." onRetry={refetch} /></div>;
  if (isLoading) return <LoadingSpinner label="Loading endorsements…" />;

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Endorsements</h1>
        <p className="mt-1 text-slate-500">See who has endorsed whom and discover skill strengths across the team.</p>
      </div>

      {/* Skill Filter */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setSelectedSkill('')}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            !selectedSkill
              ? 'bg-brand-600 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-200'
          }`}
        >
          All Skills
        </button>
        {skills?.slice(0, 15).map((skill) => (
          <button
            key={skill.id}
            onClick={() => setSelectedSkill(skill.id === selectedSkill ? '' : skill.id)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              selectedSkill === skill.id
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-200'
            }`}
          >
            {skill.name}
          </button>
        ))}
      </div>

      {!endorsements?.length ? (
        <EmptyState
          title="No endorsements found"
          description={selectedSkill ? 'No endorsements found for this skill.' : 'No endorsements have been recorded yet.'}
          icon={<svg className="h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" /></svg>}
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {endorsements.map((item) => (
            <EndorseeCard key={item.endorsee.id} {...item} />
          ))}
        </div>
      )}
    </div>
  );
}
