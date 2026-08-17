import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSkillsList } from '../hooks/useSkills.js';
import ErrorBanner from '../components/common/ErrorBanner.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import ViewToggle from '../components/common/ViewToggle.jsx';
import { SkeletonGrid, SkeletonTable } from '../components/common/Skeleton.jsx';

const CATEGORIES = ['Language', 'Framework', 'Cloud', 'Data', 'Soft Skill', 'Domain'];

const CATEGORY_ICONS = {
  Language: '💻',
  Framework: '🔧',
  Cloud: '☁️',
  Data: '📊',
  'Soft Skill': '🤝',
  Domain: '🏢',
};

export default function SkillsExplorerPage() {
  const [category, setCategory] = useState('');
  const [view, setView] = useState('card');
  const { data, isLoading, isError, refetch } = useSkillsList({ category: category || undefined });

  const skills = data?.skills ?? [];
  const categoryCounts = {};
  if (skills.length > 0) {
    skills.forEach((s) => {
      categoryCounts[s.category] = (categoryCounts[s.category] || 0) + 1;
    });
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="page-heading">Skills</h1>
          <p className="page-description">Explore the skill catalog and how skills relate to each other.</p>
        </div>
        <ViewToggle view={view} onChange={setView} />
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setCategory('')}
          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
            category === '' ? 'bg-brand-600 text-white shadow-md shadow-brand-200' : 'bg-white text-slate-600 border border-slate-200 hover:border-brand-300 hover:bg-brand-50'
          }`}
        >
          All
          {data?.skills && (
            <span className={`rounded-full px-1.5 py-0.5 text-xs ${category === '' ? 'bg-white/20' : 'bg-slate-100'}`}>
              {data.skills.length}
            </span>
          )}
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
              category === c ? 'bg-brand-600 text-white shadow-md shadow-brand-200' : 'bg-white text-slate-600 border border-slate-200 hover:border-brand-300 hover:bg-brand-50'
            }`}
          >
            <span>{CATEGORY_ICONS[c]}</span>
            {c}
            {categoryCounts[c] !== undefined && (
              <span className={`rounded-full px-1.5 py-0.5 text-xs ${category === c ? 'bg-white/20' : 'bg-slate-100'}`}>
                {categoryCounts[c]}
              </span>
            )}
          </button>
        ))}
      </div>

      {isError ? (
        <ErrorBanner message="Couldn't load skills." onRetry={refetch} />
      ) : isLoading ? (
        view === 'card' ? <SkeletonGrid count={6} cols={3} /> : <SkeletonTable rows={8} cols={4} />
      ) : skills.length === 0 ? (
        <EmptyState title="No skills in this category" icon="⚡" />
      ) : (
        <>
          {view === 'card' ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {skills.map((skill) => (
                <Link
                  key={skill.id}
                  to={`/skills/${skill.id}`}
                  className="card-base group relative overflow-hidden transition-all hover:border-brand-300 hover:shadow-md hover:shadow-brand-50"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{CATEGORY_ICONS[skill.category] || '⚡'}</span>
                      <h3 className="font-semibold text-slate-900 group-hover:text-brand-700 transition-colors">{skill.name}</h3>
                    </div>
                    <span className="shrink-0 rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">
                      {skill.category}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.25 0 015.25 0z" />
                    </svg>
                    {skill.peopleCount} {skill.peopleCount === 1 ? 'person has' : 'people have'} this skill
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-4 py-3 font-medium">Skill</th>
                      <th className="px-4 py-3 font-medium">Category</th>
                      <th className="px-4 py-3 font-medium">People</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {skills.map((skill) => (
                      <tr key={skill.id} className="transition-colors hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <Link to={`/skills/${skill.id}`} className="flex items-center gap-3">
                            <span className="text-lg">{CATEGORY_ICONS[skill.category] || '⚡'}</span>
                            <span className="font-medium text-slate-800 hover:text-brand-700 transition-colors">{skill.name}</span>
                          </Link>
                        </td>
                        <td className="px-4 py-3">
                          <span className="shrink-0 rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">
                            {skill.category}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100">
                              <div
                                className="h-full rounded-full bg-brand-500"
                                style={{ width: `${Math.min((skill.peopleCount / 30) * 100, 100)}%` }}
                              />
                            </div>
                            <span className="text-xs text-slate-500">{skill.peopleCount}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
